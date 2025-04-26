import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import { Setor } from "@/interfaces/setor";
import { Usuario } from "@/interfaces/usuario";

const getAllSetores = async (): Promise<Setor[] | ApiException> => {
  try {
    const { data } = await ApiUsuario.get(`/setor`);
    return data as Setor[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};
 

const verificarSetoresPorEmpresa = async (empCod: number): Promise<Setor[]> => {
  try {
    const response = await ApiUsuario.get(`/setor/empresa/${empCod}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data as Setor[]
  } 
  catch(error) {
    console.log(error)
    throw error
  }
} 

const getSetorUsuarios = async (setorCod: number): Promise<Usuario[] | ApiException> => {
  try {
    const { data } = await ApiUsuario.get(`/setor/${setorCod}/usuarios`);
    return data as Usuario[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const cadastrarSetor = async (setoresData: string[], empCod: number): Promise<Setor[] | ApiException> => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(setoresData, null, 2));
    const requests = setoresData.map(async (setor) => {
      const { data } = await ApiUsuario.post(`/setor`, 
        { setorNome: setor, empCod: empCod },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(`✅ Resposta do backend para "${setor}":`, data);
      return data as Setor;
    });
    const setoresCriados = await Promise.all(requests);
    return setoresCriados;
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao cadastrar setor.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const atualizarSetor = async (setorData: Setor): Promise<Setor | ApiException> => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(setorData, null, 2));
    const { data } = await ApiUsuario.put(
      `/setor/${setorData.setorCod}`,
      { setorNome: setorData.setorNome },
      { headers: { "Content-Type": "application/json" } }
    );
    console.log(`✅ Resposta do backend para setor "${setorData.setorNome}":`, data);
    return data as Setor;
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao atualizar setor.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

export const setorServices = {
  getAllSetores,
  verificarSetoresPorEmpresa,
  cadastrarSetor,
  atualizarSetor,
  getSetorUsuarios
}; 