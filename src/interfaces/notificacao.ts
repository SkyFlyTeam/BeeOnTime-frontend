export default interface NotificacaoInterface {
  alertaCod?: number;
  alertaMensagem: String;
  alertaDataCriacao?: Date;
  tipoAlerta: {
    tipoAlertaCod: number;
    tipoAlertaNome?: string;
  };
}
