import { Jornada } from "./jornada";
import { NivelAcesso } from "./nivelAcesso";
import { Setor } from "./setor";

export interface Usuario {
  [key: string]: boolean | string | number | undefined | null | Date | Jornada | Setor | NivelAcesso;
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
  usuario_status: boolean;
  }
  