export default interface SolicitacaoInterface {
    solicitacaoCod: number;
    solicitacaoMensagem: string;
    solicitacaoDevolutiva: string;
    solicitacaoDataPeriodo: [number, number, number];
    solicitacaoStatus: string
    tipoSolicitacaoCod: {
      tipoSolicitacaoCod: number;
      tipoSolicitacaoNome: string;
    };
    usuarioCod: number;
  }