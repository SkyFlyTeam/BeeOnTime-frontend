// "/auth/user/role"

// Libs
import { attemptGetLocalUserRoleID } from '../../../../lib/server/auth/login';





export async function GET(req: Request) {
    return attemptGetLocalUserRoleID(req);
}


