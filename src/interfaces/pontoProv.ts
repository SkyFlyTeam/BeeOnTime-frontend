interface Ponto {
    horarioPonto: string | Date | null;
    tipoPonto: number;
}

export default interface PontoProv {
    id: string | null | undefined;
    usuarioCod: number | null | undefined;
    solicitacaoCod: number | null | undefined;
    horasCod: number | null | undefined;
    data: string | Date | null | undefined;
    pontos: Ponto[];
}

export interface AprovarPonto {
    id: string | null | undefined
}