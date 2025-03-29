// login.ts

// npm packages
import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
// Lib
import { AccessPass } from "../../auth";
import { axiosToResponse } from "../../axiosAuth";
import { getCredsFromAuthCookie, getEmailFromAuthCookie, getTokenFromAuthCookie } from "./cookie";
// Constants
import { MS_USUARIO } from "../../constants";




async function setAuthCookie(creds: AccessPass, token: String): Promise<NextResponse> {
    const cookiePackage = `{
        "token": "${token}",
        "usuarioEmail": "${creds.usuarioEmail}",
        "usuario_senha": "${creds.usuario_senha}"
    }`

    const cookieToken = new NextResponse();
    //
    cookieToken.cookies.set({
        name: "auth-token",
        value: cookiePackage,
        httpOnly: true
    })

    return cookieToken;
}

export async function attemptLoginSession(creds: AccessPass): Promise<Response> {
    try {
        const res = await axios.post(`${MS_USUARIO}/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        const token = await res.data
        if (res.status === 200)
            return setAuthCookie(creds, token);
        return axiosToResponse(res);
    }
    catch (error) {
        const res = error as AxiosResponse;
        return axiosToResponse(res);
    }
}







async function resetAuthCookie(req: NextRequest | Request){
    const creds = getCredsFromAuthCookie(req);
    return await attemptLoginSession(creds);
}

async function getUserRoleID(email: String, req: NextRequest | Request): Promise<Response>{
    try {
        const res = await axios.get(`${MS_USUARIO}/auth/${email}`,{
            headers: { Authorization: "Bearer " + getTokenFromAuthCookie(req)}
        });
        const roleID = await res.data;
        return new Response(`{ "role": "${roleID}"}`);
    }
    catch (error) {
        const res = error as AxiosResponse;
        if (res.status === 403)
            return resetAuthCookie(req);
        return axiosToResponse(res);
    }
}

export async function attemptGetLocalUserRoleID(req: Request | NextRequest): Promise<Response> {
    const email = getEmailFromAuthCookie(req);
    if (email === "")
        return new Response(`{ "role": "Email not Found"}`, { status: HttpStatusCode.NotFound })
    return await getUserRoleID(email, req);
}

export async function attemptGetUserRoleID(email: String, req: Request | NextRequest): Promise<Response>{
    return await getUserRoleID(email, req);
}