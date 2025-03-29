// "/auth/login"

// Libs
import { AccessPass } from '@/lib/auth';
import { attemptLoginSession } from '../../../lib/server/auth/login';





// Recebe dados de Login, deve ser o único acesso aos serviços sem Token.
export async function POST(req: Request) {
    const creds = await req.text()
    console.log('/auth/login' + JSON.stringify(creds))
    return attemptLoginSession(JSON.parse(creds) as AccessPass);
}