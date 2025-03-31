export class ApiException extends Error {
  public readonly message: string;

  constructor(mensagem: string) {
    super(mensagem);
    this.message = mensagem;
  }
}
