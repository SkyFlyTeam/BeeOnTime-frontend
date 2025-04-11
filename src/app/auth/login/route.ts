// "/auth/login"

// Libs
import { AccessPass } from '@/lib/server/auth';
import { attemptLoginSession, attemptNewEmail } from '../../../lib/server/auth/login';





// Recebe dados de Login, deve ser o único acesso aos serviços sem Token.
export async function POST(req: Request) {
    const creds = await req.text()
    return attemptLoginSession(JSON.parse(creds) as AccessPass);
}


export async function PUT(req: Request) {
    const email = await req.text();
    console.log(email)
    return attemptNewEmail(email, req);
}