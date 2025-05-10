export default interface Horas {
    horasCod?: number,
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas:number,
    horasFaltantes: number,
    horasData: string | Date,
    usuarioCod: number
}

export interface HorasDTO {
    horasCod?: number,
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas:number,
    horasFaltantes: number,
    horasData: string | Date,
    usuarioCod: number,
    usuarioNome: string,
    jornada_horarioEntrada: string,
    horarioBatida: string
}

