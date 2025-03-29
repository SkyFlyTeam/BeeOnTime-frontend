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

    //const cookieToken = NextResponse.json({ token: token });
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
        console.log("attemptLoginSession START "+JSON.stringify(creds))
        const res = await axios.post(`${MS_USUARIO}/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        console.log("attemptLoginSession AXIOS "+JSON.stringify(creds))
        const tester = await res.data
        console.log("attemptLoginSession DATA "+tester+" "+res.status) 
        if (res.status === 200)
            return setAuthCookie(creds, tester);
        return axiosToResponse(res);
    }
    catch (error) {
        const res = error as AxiosResponse;
        console.log("error " + await res.data + res.status)
        return axiosToResponse(res);
    }
}







async function resetAuthCookie(req: NextRequest | Request){
    console.log("Resetting 'auth-token' cookie.")
    const creds = getCredsFromAuthCookie(req);
    return await attemptLoginSession(creds);
}

async function getUserRoleID(email: String, req: NextRequest | Request): Promise<Response>{
    try {
        console.log("getUserRoleID " +email)
        const res = await axios.get(`${MS_USUARIO}/auth/${email}`,{
            headers: { Authorization: "Bearer " + getTokenFromAuthCookie(req)}
        });
        const tester = await res.data;
        console.log("getUserRoleID " +tester)
        return new Response(`{ "role": "${tester}"}`);
    }
    catch (error) {
        const res = error as AxiosResponse;
        const  tester = await res.data
        console.log("getUserRoleID ERROR "+tester + " " +res.status)
        if (res.status === 403)
            return resetAuthCookie(req);
        return axiosToResponse(res);
    }
}

export async function attemptGetLocalUserRoleID(req: Request | NextRequest): Promise<Response> {
    const email = getEmailFromAuthCookie(req);
    console.log("attemptGetLocalUserRoleID "+email)
    if (email === "")
        return new Response(`{ "role": "Email not Found"}`, { status: HttpStatusCode.NotFound })
    console.log("attemptGetLocalUserRoleID SUCC "+email)
    return await getUserRoleID(email, req);
}

export async function attemptGetUserRoleID(email: String, req: Request | NextRequest): Promise<Response>{
    return await getUserRoleID(email, req);
}