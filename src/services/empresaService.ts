import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import { Empresa, EmpresaAPI } from "@/interfaces/empresa";

const verificarEmpresa = async (): Promise<EmpresaAPI[] | ApiException> => {
  try {
    const { data } = await ApiUsuario.get('/empresa');
    return data as EmpresaAPI[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar empresas.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const cadastrarEmpresa = async (formData: any): Promise<number | ApiException> => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(formData, null, 2));
    const { data } = await ApiUsuario.post('/empresa', formData, {
      headers: { "Content-Type": "application/json" }
    });
    console.log("✅ Resposta do backend:", data);
    return (data as { empCod: number }).empCod;
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao cadastrar empresa.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const atualizarEmpresa = async (empresaData: EmpresaAPI): Promise<number | ApiException> => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(empresaData, null, 2));
    const { data } = await ApiUsuario.put(
      `/empresa/${empresaData.empCod}`,
      empresaData,
      { headers: { "Content-Type": "application/json" } }
    );
    console.log("✅ Resposta do backend:", data);
    return (data as { status: number }).status;
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao atualizar empresa.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

export const empresaServices = {
  verificarEmpresa,
  cadastrarEmpresa,
  atualizarEmpresa
};