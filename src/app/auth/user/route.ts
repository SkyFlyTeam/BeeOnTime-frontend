// "/auth/user"

// Libs
import { attemptGetLocalUserRoleID } from '@/src/lib/server/auth/login';





export async function GET(req: Request) {
    return attemptGetLocalUserRoleID(req);
}


