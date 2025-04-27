import { Usuario } from "@/interfaces/usuario";

export const calculateUserCargaMensal = (usuario: Usuario) => {
    const dias_trabalhados = usuario.jornadas.jornada_diasSemana
    let total_dias_trabalhados = 0

    dias_trabalhados.forEach((dia) => {
        if(dia){
            total_dias_trabalhados += 1
        }
    })

    const cargaMensal = (total_dias_trabalhados * 4) * usuario.usuario_cargaHoraria
    return cargaMensal;
}