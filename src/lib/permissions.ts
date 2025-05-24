import { NextRequest } from "next/server"

const ROLES = {
    ADMIN: 0,
    GESTOR: 1,
    FUNCIONARIO: 2
}
const accessRoutes = {
    ADMIN: [
        "/perfil",
        "/inicio",
        "/bancoHoras",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/jornada",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/empresa",
        "/perfil",
        "/historico-ponto",
        "/Colaboradores",
        "/notFound",
        "/ausencias",
        "/falhas_marcacoes",
        "/pontosDiarios",
    ],
    GESTOR: [
        "/perfil",
        "/inicio",
        "/bancoHoras",
        "/ausencias",
        "/falhas",
        "/colaboradores",
        "/jornada",
        "/solicitacao",
        "/pendencias",
        "/calendario",
        "/perfil",
        "/inicioFuncionario",
        "/historico-ponto",
        "/Colaboradores",
        "/notFound",
        "/ausencias",
        "/falhas_marcacoes",
        "/pontosDiarios",
    ],
    FUNCIONARIO: [
        "/perfil",
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
