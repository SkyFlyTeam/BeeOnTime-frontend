export interface Ponto {
    horarioPonto: string | Date;
    tipoPonto: number;
}

export default interface MarcacaoPonto {
    id: string;
    usuarioCod: number;
    horasCod: number;
    data: string | Date;
    pontos: Ponto[];
}