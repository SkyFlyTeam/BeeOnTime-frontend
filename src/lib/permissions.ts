import { NextRequest } from "next/server"

const ROLES = {
    ADMIN: 0,
    GESTOR: 1,
    FUNCIONARIO: 2
}
const accessRoutes = {
    ADMIN: [
        "/administrador",
        "/inicio",
        "/horas",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/empresa",
        "/perfil",
        "/inicioFuncionario",
    ],
    GESTOR: [
        "/gestor",
        "/inicio",
        "/horas",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/perfil"
    ],
    FUNCIONARIO: [
        "/funcionario",
        "/inicio",
        "/solicitacao",
        "/marcacoes",
        "/horas",
        "/pendencias",
        "/inicioFuncionario",
    ]
}


function getRoleName(roleID: number): string | undefined {
    const name = Object.keys(ROLES).find(name => ROLES[name as keyof typeof ROLES] == roleID)
    return name;
}

export function checkAccess(roleID: number, req: NextRequest): Boolean{
    const role = getRoleName(roleID)
    if (role === undefined)
        return false;
    return accessRoutes[role as keyof typeof accessRoutes].includes(req.nextUrl.pathname);
}
