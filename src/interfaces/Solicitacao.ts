export default interface SolicitacaoInterface {
  solicitacaoCod: number;
  solicitacaoAnexo: number[] | null
  solicitacaoAnexoNome?: string
  solicitacaoMensagem: string;
  solicitacaoDevolutiva: string;
  solicitacaoDataPeriodo: string;
  solicitacaoStatus: string
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