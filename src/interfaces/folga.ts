export interface FolgaTipo {
    tipoFolgaCod: number;
    tipoFolgaNome: string;
  }
  
  export default interface Folga {
    folgaCod: number;
    folgaDataPeriodo: string[];
    folgaObservacao: string;
    folgaDiasUteis: number;
    usuarioCod: number;
    folgaTipo: FolgaTipo;
}