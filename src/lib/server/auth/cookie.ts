import { NextRequest } from "next/server";
//
import { AccessPass } from "../../auth";





function getAuthTokenContent(req: NextRequest | Request): string {
    const res = (req as NextRequest).cookies.get('auth-token')?.value;
    if (res === undefined)
        return "";
    console.log(res as string)
    return res as string;
}

export function getContentFromAuthCookie(req: NextRequest | Request): String {
    try {
        const content = getAuthTokenContent(req);
        return content;
    }
    catch (error) {
        console.log("getEmailFromAuthCookie(): \n" + error)
        return "";
    }
}

export function getEmailFromAuthCookie(req: NextRequest | Request): String {
    try {
        const prop = getAuthTokenContent(req);
        if (prop === "")
            return prop;
        const email = JSON.parse(getAuthTokenContent(req)).usuarioEmail;
        return email;
    }
    catch (error) {
        console.log("getEmailFromAuthCookie(): \n" + error)
        return "";
    }
}
export function getCredsFromAuthCookie(req: NextRequest | Request): AccessPass {
    try {
        const prop = getAuthTokenContent(req);
        if (prop === "")
            return {
                usuarioEmail: "",
                usuario_senha: ""
            } as AccessPass;
        const data = JSON.parse(getAuthTokenContent(req));
        const creds: AccessPass = {
            usuarioEmail: data.usuarioEmail,
            usuario_senha: data.usuario_senha
        }
        return creds;
    }
    catch (error) {
        console.log("getCredsFromAuthCookie(): \n" + error)
        const credsFake: AccessPass = {
            usuarioEmail: "",
            usuario_senha: ""
        }
        return credsFake;
    }
}
export function getTokenFromAuthCookie(req: NextRequest | Request): String {
    try {
        const prop = getAuthTokenContent(req);
        if (prop === "")
            return prop;
        const token = JSON.parse(getAuthTokenContent(req)).token;
        return token;
    }
    catch (error) {
        console.log("getTokenFromAuthCookie(): \n" + error)
        return "";
    }
}



export function hasAuthCookie(req: NextRequest | Request) {
    return (req as NextRequest).cookies.get('auth-token') !== undefined;
}


