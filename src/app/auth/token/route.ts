// "/auth/token"

// Libs
import { getContentFromAuthCookie, hasAuthCookie } from "../../../lib/server/auth/cookie";


// Recebe dados de Login, deve ser o único acesso aos serviços sem Token.
export async function GET(req: Request) {
    return new Response("" + getContentFromAuthCookie(req));
}