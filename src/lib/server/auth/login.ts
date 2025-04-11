export enum HttpStatusCode {
    OK = 200,
    Created = 201,
    BadRequest = 400,
    Unauthorized = 401,
    Forbidden = 403,
    NotFound = 404,
    InternalServerError = 500,
  }

// login.ts

// npm packages
import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
// Lib
import { AccessPass } from "../../auth";
import { axiosToResponse } from "../../axiosAuth";
import { getCodFromAuthCookie, getCredsFromAuthCookie, getEmailFromAuthCookie, getTokenFromAuthCookie } from "./cookie";
// Constants
import { MS_USUARIO } from "../../constants";




function setAuthCookie(creds: AccessPass, id: String, token: String, jsonPassthrough?: string): NextResponse {
    const cookiePackage = `{
        "token": "${token}",
        "usuario_cod": "${id}",
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
async function setLoginSession(creds: AccessPass, msg?: string): Promise<Response> {
    try {
        const res = await axios.post(`${MS_USUARIO}/auth/login`, JSON.stringify(creds), {
            headers: { "Content-Type": "application/json" },
        });
        const json = (await res.data);
        return new Response(JSON.stringify(json));
    }
    catch (error) {
        return axiosToResponse(error as any);
    }
}
export async function attemptLoginSession(creds: AccessPass): Promise<Response> {
    const res = await setLoginSession(creds);
    if (res.status != 200)
        return res;
    const resJson = await res.json()
    return setAuthCookie(creds, resJson.id, resJson.token);
}

async function resetAuthCookie(req: NextRequest | Request, msg?: string) {
    const creds = getCredsFromAuthCookie(req);
    return await setLoginSession(creds, msg);
}

async function getUserRoleID(email: String, req: NextRequest | Request, token?: String) {
    try {
        const res = await axios.get(`${MS_USUARIO}/auth/${email}`, {
            headers: { Authorization: "Bearer " + (token != undefined ? token : getTokenFromAuthCookie(req)) }
        });
        const roleID = await res.data;
        return new Response(`{ "role": "${roleID}"}`);
    }
    catch (error) { return axiosToResponse(error as any) }
}



async function attemptUserRoleID(email: String, req: NextRequest | Request): Promise<Response> {
    const res = await getUserRoleID(email, req);
    if (res.status == 200)
        return res;

    const reset = await resetAuthCookie(req, "token");
    if (reset.status != 200)
        return reset;

    const cookie = await reset.json();
    const lastTry = await getUserRoleID(email, req, cookie.token);
    if (lastTry.status != 200)
        return lastTry;
    return setAuthCookie({ usuarioEmail: cookie.usuarioEmail, usuario_senha: cookie.usuario_senha } as AccessPass, cookie.usuario_cod, cookie.token, (await lastTry.json()))
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







export async function attemptNewEmail(email: string, req: Request): Promise<Response>{
    const senha = getCredsFromAuthCookie(req).usuario_senha;
    const creds: AccessPass = {
        usuarioEmail: email,
        usuario_senha: senha
    }
    return attemptLoginSession(creds);
}

//
//
//
//
async function getUserData(id: String, req: NextRequest | Request, token?: String) {
    try {
        const res = await axios.get(`${MS_USUARIO}/usuario/${id}`, {
            headers: { Authorization: "Bearer " + (token != undefined ? token : getTokenFromAuthCookie(req)) }
        });
        const usuario = await res.data;
        return new Response(JSON.stringify(usuario));
    }
    catch (error) { return axiosToResponse(error as any) }
}

export async function attemptLocalUsuarioData(req: Request | NextRequest) {
    const res = await getUserData(getCodFromAuthCookie(req), req, getTokenFromAuthCookie(req))
    console.log("attemptUsuarioData  >  res: " + res.status)
    if (res.status == 200)
        return res;

    const reset = await resetAuthCookie(req, "token");
    console.log("attemptUserRoleID  >  reset: " + reset.status)
    if (reset.status != 200)
        return reset;

    const cookie = await reset.json();
    const lastTry = await getUserData(cookie.usuario_cod, req, cookie.token);
    console.log("attemptUserRoleID  >  lastTry: " + reset.status)
    console.log("cookie : " + JSON.stringify(cookie))
    if (lastTry.status != 200)
        return lastTry;
    return setAuthCookie({ usuarioEmail: cookie.usuarioEmail, usuario_senha: cookie.usuario_senha } as AccessPass, cookie.usuario_cod, cookie.token, (await lastTry.json()))
}