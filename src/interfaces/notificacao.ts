export default interface NotificacaoInterface {
  alertaCod?: number;
  alertaMensagem: string;
  alertaDataCriacao?: Date | string; // Pode vir como string em JSON
  tipoAlerta: {
    tipoAlertaCod: number;
    tipoAlertaNome?: string;
  };
  alertaSetorDirecionado?: string;
  alertaUserAlvo?: number;
}
