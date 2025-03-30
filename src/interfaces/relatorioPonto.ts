export interface Ponto {
    horarioPonto: string | Date;
    tipoPonto: number;
}

export default interface RelatorioPonto {
    id: string;
    usuarioCod: number;
    horasCod: number;
    data: string | Date;
    pontos: Ponto[];
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas:number,
    horasFaltantes: number,
    horasData: string | Date,
}