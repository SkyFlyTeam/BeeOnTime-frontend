import { NextResponse, NextRequest } from 'next/server'
import { hasAuthCookie } from './lib/server/auth/cookie';
import { attemptGetLocalUserRoleID } from './lib/server/auth/login';
import { checkAccess } from './lib/permissions';






function isPath(targetName: String, req: NextRequest): boolean {
    return req.nextUrl.pathname === targetName;
}
async function isAuthenticated(req: NextRequest) {
    if (!hasAuthCookie(req))
        return undefined;


    try {
        const res = await attemptGetLocalUserRoleID(req);
        const test = await res.json()
        if (res.status == 200)
            return test.role
    }
    catch (error) { }
    return undefined;
}
async function isAuthorized(roleID: number, req: NextRequest) {
    return checkAccess(roleID, req);
}




// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
    // Get role ID if logged in; 'undefined' if not
    const role = await isAuthenticated(req);
    if (role === undefined)
        if (isPath("/", req))
            return NextResponse.next();
        else
            return NextResponse.redirect(new URL("/", req.url)); // Enforces Login page address


    // Allows to Logout when authorized
    if (isPath("/logout", req)) {
        const res = new NextResponse("Logged out.");
        res.cookies.delete('auth-token');
        return res;
    }


    // Access pass, controlled in "@/src/lib/permissions.ts"
    if (!(await isAuthorized(role, req)))
        if (isPath("/", req))
            return NextResponse.rewrite(new URL("/inicio", req.url));
        else
            return new NextResponse("Not authorized.");
}



// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/:path', '/'],
}
