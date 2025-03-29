// "/auth/user"

// Libs
import { attemptGetUserRoleID } from '../../../lib/server/auth/login';





export async function GET(req: Request, { params }: { params: Promise<{ email: String }> }) {
    const email = (await params).email;
    return attemptGetUserRoleID(email, req);
}
