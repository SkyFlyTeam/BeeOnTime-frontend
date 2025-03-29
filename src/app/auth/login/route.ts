// "/auth/login"

// Libs
import { attemptLoginSession } from "@/src/lib/server/auth/login";





// Recebe dados de Login, deve ser o único acesso aos serviços sem Token.
export async function POST(req: Request) {
    const creds = await req.json()
    return attemptLoginSession(creds);
}