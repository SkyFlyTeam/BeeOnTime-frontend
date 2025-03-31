import { Jornada } from "./jornada";
import { Setor } from "./setor";

export interface Usuario {
    usuario_cod: number;
    usuario_nome: string;
    usuario_cpf: string;
    usuario_nRegistro: number;
    usuario_cargaHoraria: number;
    usuarioTipoContratacao: string;
    usuario_dataContratacao: string; // Usando string para a data, pois geralmente enviamos a data em formato ISO 8601
    usuario_senha: string;
    usuario_email: string;
    usuario_DataNascimento: string; // Usando string para a data também
    usuario_cargo: string;
    jornadas: Jornada; // Referência para a interface JornadaDTO
    empCod: number;
    setor: Setor; // Se você tiver a interface SetorDTO, ela pode ser importada e utilizada aqui
    nivelAcesso_cod: number; // Se você tiver a interface NivelAcessoDTO, ela pode ser importada e utilizada aqui
  }
  