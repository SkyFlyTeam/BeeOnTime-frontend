export default interface SolicitacaoInterface {
  Solicitacao_data: string | Date;
  solicitacaoTipoNome: string;
  solicitacaoData: string | number | Date;
  dataCriacao: string | number | Date;
  solicitacaoCod: number;
  solicitacaoAnexo: number[] | null
  solicitacaoAnexoNome?: string
  solicitacaoMensagem?: string;
  solicitacaoDevolutiva?: string;
  solicitacaoDataPeriodo?: string;
  solicitacaoStatus?: string
  horasSolicitadas?: number | null
  tipoSolicitacaoCod?: {
    tipoSolicitacaoCod?: number;
    tipoSolicitacaoNome: string;
  };
  usuarioCod: number;
  usuarioNome?: string;
  usuarioCargo?: string;
}

export interface CriarSolicitacaoInterface {
  solicitacaoMensagem: string,
  solicitacaoAnexo: File | null,
  tipoSolicitacaoCod: {
      tipoSolicitacaoCod: number
  },
  usuarioCod: number
}

export interface TipoSolicitacao  {
  tipoSolicitacaoCod: number;
  tipoSolicitacaoNome: string;
};