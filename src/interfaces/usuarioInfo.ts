interface Jornada {
    jornadaCod: number;
    jornadaHorarioFlexivel: string | null;
    jornadaDiasSemana: string[];
    jornadaHorarioEntrada: string | Date;
    jornadaHorarioSaida: string | Date;
    jornadaHorarioAlmoco: string | null;
    usuarioCod: number;
}

export default interface UsuarioInfo {
    usuarioCod: number;
    usuarioNome: string;
    usuarioCpf: string;
    usuarioNrRegistro: string | null;
    usuarioCargaHoraria: number;
    usuarioTipoContratacao: string;
    usuarioDataContratacao: string | Date;
    usuarioSenha: string;
    usuarioEmail: string;
    usuarioDataNascimento: string | Date;
    usuarioCargo: string;
    jornadas: Jornada[];
    usuarioNRegistro: string | null;
}
