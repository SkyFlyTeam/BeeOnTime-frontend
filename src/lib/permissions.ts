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
        "/bancoHoras",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/empresa",
        "/perfil",
        "/historico-ponto",
        "/Colaboradores",
        "/notFound"
    ],
    GESTOR: [
        "/gestor",
        "/inicio",
        "/bancoHoras",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/perfil",
        "/inicioFuncionario",
        "/historico-ponto",
        "/Colaboradores",
        "/notFound"
    ],
    FUNCIONARIO: [
        "/funcionario",
        "/inicio",
        "/solicitacao",
        "/marcacoes",
        "/bancoHoras",
        "/pendencias",
        "/inicioFuncionario",
        "/historico-ponto",
        "/notFound"
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
