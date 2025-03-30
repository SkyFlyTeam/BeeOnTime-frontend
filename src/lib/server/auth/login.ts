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




function setAuthCookie(creds: AccessPass, token: String, jsonPassthrough?: string): NextResponse {
    const cookiePackage = `{
        "token": "${token}",
        "usuarioEmail": "${creds.usuarioEmail}",
        "usuario_senha": "${creds.usuario_senha}"
    }`

    let cookieToken;
    if (jsonPassthrough != undefined)
        if(jsonPassthrough == "token")
            cookieToken = NextResponse.json(cookiePackage);
        else
            cookieToken = NextResponse.json(jsonPassthrough);
    else
        cookieToken = new NextResponse()
    //
    cookieToken.cookies.set({
        name: "auth-token",
        value: cookiePackage,
        httpOnly: true
    })

    return cookieToken;
}

export async function attemptLoginSession(creds: AccessPass, msg?: string): Promise<Response> {
    try {
        const res = await axios.post(`${MS_USUARIO}/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        const token = await res.data
        if (res.status === 200)
            return setAuthCookie(creds, token, msg);
        return axiosToResponse(res);
    }
    catch (error) {
        const res = error as AxiosResponse;
        return axiosToResponse(res);
    }
}






async function resetAuthCookie(req: NextRequest | Request, msg?: string) {
    const creds = getCredsFromAuthCookie(req);
    return await attemptLoginSession(creds, msg);
}






async function getUserRoleID(email: String, req: NextRequest | Request, token?: String) {
    try {
        const res = await axios.get(`${MS_USUARIO}/auth/${email}`, {
            headers: { Authorization: "Bearer " + (token != undefined ? token : getTokenFromAuthCookie(req)) }
        });
        const roleID = await res.data;
        return new Response(`{ "role": "${roleID}"}`);
    }
    catch (error) { return axiosToResponse(error as AxiosResponse) }
}



async function attemptUserRoleID(email: String, req: NextRequest | Request): Promise<Response> {
    const res = await getUserRoleID(email, req);
    console.log("attemptUserRoleID  >  res: " + res.status)
    if (res.status == 200)
        return res;

    const reset = await resetAuthCookie(req, "token");
    console.log("attemptUserRoleID  >  reset: " + reset.status)
    if (reset.status != 200)
        return reset;

    const cookie = JSON.parse((await reset.json()));
    const lastTry = await getUserRoleID(email, req, cookie.token);
    console.log("attemptUserRoleID  >  lastTry: " + reset.status)
    if(lastTry.status != 200)
        return lastTry;
    return setAuthCookie( { usuarioEmail: cookie.usuarioEmail, usuario_senha: cookie.usuario_senha} as AccessPass, cookie.token, (await lastTry.json()))
}

export async function attemptGetLocalUserRoleID(req: Request | NextRequest): Promise<Response> {
    const email = getEmailFromAuthCookie(req);
    if (email === "")
        return new Response(`{ "role": "Email not Found"}`, { status: HttpStatusCode.NotFound })
    return await attemptUserRoleID(email, req);
}

export async function attemptGetUserRoleID(email: String, req: Request | NextRequest): Promise<Response> {
    return await attemptUserRoleID(email, req);
}