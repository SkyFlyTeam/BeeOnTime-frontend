export default interface SolicitacaoInterface {
  dataCriacao: string | number | Date;
  solicitacaoCod: number;
  solicitacaoAnexo: number[] | null
  solicitacaoAnexoNome?: string
  solicitacaoMensagem: string;
  solicitacaoDevolutiva: string;
  solicitacaoDataPeriodo: Date[];
  solicitacaoStatus: string
  horasSolicitadas: number | null
  tipoSolicitacaoCod: {
    tipoSolicitacaoCod: number;
    tipoSolicitacaoNome: string;
  };
  usuarioCod: number;
  usuarioNome: string;
  usuarioCargo: string;
}

export interface CriarSolicitacaoInterface {
  solicitacaoMensagem: string,
  solicitacaoAnexo: File | null,
  tipoSolicitacaoCod: {
      tipoSolicitacaoCod: number
  },
  usuarioCod: number
}