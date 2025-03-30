import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import Setor from "@/interfaces/usuarioInfo";

// Função para obter todos os sotores
const getAllSetores = async () => {
  try {
    const response = await ApiUsuario.get(`/setor`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
  
    return new ApiException("Erro desconhecido.");
  }
};

export const setorSevices = {
  getAllSetores
}


