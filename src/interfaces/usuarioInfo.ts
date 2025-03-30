export interface Jornada {
    jornada_cod: number;
    jornada_horarioFlexivel: string | null;
    jornada_diasSemana: string[];
    jornada_horarioEntrada: string | Date;
    jornada_horarioSaida: string | Date;
    jornada_horarioAlmoco: string | null;
    usuario_cod: number;
}

export interface Setor {
    setorCod: number;
    setorNome: string;
}

export interface NivelAcesso {
    nivelAcesso_cod: number;
    nivelAcesso_nome: string;
}


export default interface UsuarioInfo {
    [key: string]: string | number | undefined | null | Date | Jornada | Setor | NivelAcesso;
    usuario_cod: number;
    usuario_nome: string;
    usuario_cpf: string;
    usuario_nrRegistro: string | null;
    usuario_cargaHoraria: number;
    usuarioTipoContratacao: string;
    usuario_dataContratacao: string | Date;
    usuario_senha: string;
    usuarioEmail: string;
    usuario_DataNascimento: string | Date;
    usuario_cargo: string;
    jornadas: Jornada;
    usuarioNRegistro: string | null;
    setor: Setor;
    empCod: number;
    nivelAcesso: NivelAcesso;
}