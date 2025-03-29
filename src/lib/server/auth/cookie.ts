import { cookies } from "next/headers";
import { NextRequest } from "next/server";
//
import { AccessPass } from "@/src/lib/auth";





async function getAuthTokenContent(req?: NextRequest | Request): Promise<string>{
    if (req !== undefined)
        return (req as NextRequest).cookies.get('auth-token')?.value as string;
    return (await cookies()).get('auth-token')?.value as string;
}




export async function getEmailFromAuthCookie(req?: NextRequest | Request): Promise<String> {
    try {
        const email = JSON.parse(await getAuthTokenContent(req)).usuarioEmail;
        return email;
    }
    catch (error) {
        console.log("\ngetEmailFromAuthCookie(): \n\n"+error)
        return "";
    }
}
export async function getCredsFromAuthCookie(req?: NextRequest | Request): Promise<AccessPass> {
    try {
        const data = JSON.parse(await getAuthTokenContent(req));
        const creds: AccessPass = {
            usuarioEmail: data.usuarioEmail,
            usuario_senha: data.usuario_senha
        }
        return creds;
    }
    catch (error) {
        console.log("\ngetCredsFromAuthCookie(): \n\n"+error)
        const credsFake: AccessPass = {
            usuarioEmail: "",
            usuario_senha: ""
        }
        return credsFake;
    }
}
export async function getTokenFromAuthCookie(req?: NextRequest | Request): Promise<String> {
    try {
        const token = JSON.parse(await getAuthTokenContent(req)).token;
        return token;
    }
    catch (error) {
        console.log("\ngetTokenFromAuthCookie(): \n\n"+error)
        return "";
    }
}



export async function hasAuthCookie(req?: NextRequest | Request) {
    if(req === undefined)
        return (await cookies()).get('auth-token') !== undefined;
    return (req as NextRequest).cookies.get('auth-token') !== undefined;
}


