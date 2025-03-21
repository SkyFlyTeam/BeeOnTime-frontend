import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'



interface User {
    name: string
    pass: string
    role: number
}
const ROLES = {
    ADMIN: 0,
    GESTOR: 1,
    FUNCIONARIO: 2,
    ESTAGIARIO: 3
}
const currentUser: User = {
    name: "me",
    pass: "me",
    //role: ROLES.ADMIN
    role: -1
}
const accessRoutes = {
    ADMIN: [
        "/inicio",
        "/horas",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacoes",
        "/pendencias",
        "/calendario",
        "/empresa",
        "/perfil"
    ],
    GESTOR: [
        "/inicio",
        "/horas",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacoes",
        "/pendencias",
        "/calendario",
        "/perfil"
    ],
    FUNCIONARIO: [
        "/inicio",
        "/solicitacoes",
        "/marcacoes",
        "/horas",
        "/pendencias"
    ]/*,
    ESTAGIARIO: [
        "/inicio",
        "/solicitacoes",
        "/marcacoes",
        "/horas",
        "/pendencias"
    ]*/
}

function isPathLogin(path: string) {
    if (path === "/login")
        return true
    return false
}
function getRoleName(roleID: number): string {
    const name = Object.keys(ROLES).find(name => ROLES[name as keyof typeof ROLES] === roleID)
    if (typeof name === "undefined")
        return ""
    return name;
}
function isUserAllowed(user: User, path: string): boolean {
    const role = getRoleName(user.role)
    return accessRoutes[role as keyof typeof accessRoutes].includes(path);
}
function isUserLogged(user: User): boolean {
    if (typeof user === "undefined")
        return false
    else
        if (user.role === -1)
            return false
    return Object.values(ROLES).includes(+user.role);
}


// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {/*
    console.log(isUserLogged(currentUser))
    if (!isUserLogged(currentUser))
        return NextResponse.redirect(new URL("/login", request.url));
    
    console.log("pass")
    if (isPathLogin(request.nextUrl.pathname))
        return NextResponse.redirect(new URL("/inicio", request.url))

    if (!isUserAllowed(currentUser, request.nextUrl.pathname))
        return new NextResponse("Não autorizado.");
    
    return NextResponse.rewrite(new URL("/test", request.url))
*/
}

// See "Matching Paths" below to learn more
export const config = {
    matcher: ['/:path', '/'],
}