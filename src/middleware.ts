import { NextResponse, NextRequest } from 'next/server'
import { hasAuthCookie } from './lib/server/auth/cookie';
import { attemptGetLocalUserRoleID } from './lib/server/auth/login';
import { checkAccess } from './lib/permissions';





async function myDEBUG(req: NextRequest){
    
    const tester = await attemptGetLocalUserRoleID(req);
    const test = await tester.text();
    const role = test == undefined ? -1 : JSON.parse(test).role;
    console.log(`
        ${req.nextUrl.pathname}

        hasAuthCookie(): ${await hasAuthCookie()}
        attemptGetLocalUserRoleID(): ${tester}
            .text(): ${test}
            .role(): ${role}
        checkAccess(): ${checkAccess(role, req)}
        
        isAuthenticated(): ${await isAuthenticated(req)}
        isAuthorized(): ${await isAuthorized(role, req)}
        
        `)
}


function isPath(targetName: String, req: NextRequest): boolean {
    return req.nextUrl.pathname === targetName;
}
async function isAuthenticated(req: NextRequest){
    if(!(await hasAuthCookie()))
        return undefined;

    const res = await attemptGetLocalUserRoleID();
    if(res.status == 200)
        return (await res.json()).role
    return undefined;
}
async function isAuthorized(roleID: number, req: NextRequest) {
    return checkAccess(roleID, req);
}




// This function can be marked `async` if using `await` inside
export async function middleware(req: NextRequest) {
    myDEBUG(req);

    if(isPath("/test", req))
        return NextResponse.next();
    

    const role = await isAuthenticated(req);
    if(role === undefined)
        if(isPath("/login", req))
            return NextResponse.next();
        else
            return NextResponse.rewrite(new URL("/login", req.url));
    

    
    if(isPath("/logout", req)){
        const res = new NextResponse("Logged out.");
        res.cookies.delete('auth-token');
        return res;
    }


    if(!(await isAuthorized(role, req)))
        if(isPath("/login", req) || isPath("/", req))
            return NextResponse.rewrite(new URL("/inicio", req.url));
        else
            return new NextResponse("Not authorized.");
}



// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/:path', '/'],
}


// This function can be marked `async` if using `await` inside
//export async function middleware(request: NextRequest) {
    /*console.log(
        `
        hasAuthCookie: ${hasAuthCookie(request)}
        isPathLogin: ${isPathLogin(request)}
        checkLogout: ${checkLogout(request)}
        isUserAllowed: ${await isUserAllowed(request)}
        `
    )
    if (!hasAuthCookie(request))
        if (isPathLogin(request))
            return NextResponse.next();
        else
            return NextResponse.redirect(new URL("/login", request.url));




    if (checkLogout(request)) {

        const response = new NextResponse("Logged out");
        response.cookies.delete('auth-token');
        return response;
        //deleteAuthCookie();
    }
    //return logOut();
    
    if (!await isUserAllowed(request))
        return new NextResponse("Não autorizado.");
    else
        return NextResponse.rewrite(new URL("/test", request.url));
*/





    //if (isUserAllowed())

    /*
    if (!isPathLogin(request))
        if (!isAuthenticated(request.cookies))
            if (!isUserAllowed(currentUser, request.nextUrl.pathname))
                return new NextResponse("Não autorizado.");
            else
                return NextResponse.rewrite(new URL("/test", request.url));
        else
            return NextResponse.redirect(new URL("/login", request.url));
    else
        if (isAuthenticated(request.cookies))
            return NextResponse.redirect(new URL("/inicio", request.url));
    
}
*/



