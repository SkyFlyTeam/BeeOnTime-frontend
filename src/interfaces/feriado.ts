export interface Feriado {
    feriadoCod: number;
    feriadoData: string | Date;
    feriadoNome: string;
    empCod: number;
}

export interface FeriadoAPIResponse {
  data: string | Date;
  feriado: string;
  tipo: string /*'feriado' | 'facultativo' */
}
  