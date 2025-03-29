// login.ts

// npm packages
import axios, { AxiosResponse, HttpStatusCode } from "axios";
import { NextRequest, NextResponse } from "next/server";
// Lib
import { AccessPass } from "@/src/lib/auth";
import axiosAuth, { axiosToResponse } from "@/src/lib/axiosAuth";
import { getCredsFromAuthCookie, getEmailFromAuthCookie } from "@/src/lib/server/auth/cookie";
// Constants
import { MS_LOGIN } from "@/src/lib/constants";




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
async function resetAuthCookie(req?: NextRequest | Request){
    //console.log("Resetting 'auth-token' cookie.")
    const creds = await getCredsFromAuthCookie(req);
    return await attemptLoginSession(creds);
}
async function getUserRoleID(email: String, req?: NextRequest | Request): Promise<Response>{
    try {
        const res = await axiosAuth.get(`${MS_LOGIN}/auth/${email}`);
        return new Response(`{ "role": "${res.data}"}`);
    }
    catch (error) {
        const res = error as AxiosResponse;
        if (res.status === 403)
            return resetAuthCookie(req);
        return axiosToResponse(res);
    }
}





export async function attemptLoginSession(creds: AccessPass): Promise<Response> {
    try {
        const res = await axios.post(`${MS_LOGIN}/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        //
        if (res.status === 200)
            return setAuthCookie(creds, await res.data);
        return axiosToResponse(res);
    }
    catch (error) {
        const res = error as AxiosResponse;
        return axiosToResponse(res);
    }
}

export async function attemptGetLocalUserRoleID(req?: Request | NextRequest): Promise<Response> {
    const email = await getEmailFromAuthCookie(req);
    if (email === "")
        return new Response(`{ "text": "Email not Found"}`, { status: HttpStatusCode.NotFound })
    return getUserRoleID(email);
}

export async function attemptGetUserRoleID(email: String, req?: Request | NextRequest): Promise<Response>{
    return getUserRoleID(email, req);
}