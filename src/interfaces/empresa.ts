export interface Empresa {
  emp_nome: string;
  emp_razaoSocial: string;
  emp_CNPJ: string;
  emp_CEP: string;
}

export interface EmpresaAPI {
  empCod: number;
  empNome: string;
  empCnpj: string;
  empRazaoSocial: string;
  empCep: string;
  empCidade: string;
  empEstado: string;
  empEndereco: string;
} 