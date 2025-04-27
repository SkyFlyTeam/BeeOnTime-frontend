import { ApiException } from "../config/apiExceptions";
import { ApiSolicitacao } from "../config/apiSolicitacao";
// import SolicitacaoInterface, { EnviarSolciitacaoInterface } from "../interfaces/Solicitacao";
import SolicitacaoInterface, { CriarSolicitacaoFolgaInterface } from "../interfaces/SolicitacaoFolga";


const getAllSolicitacaoFolga = async (): Promise<SolicitacaoInterface[] | ApiException> => {
  try {
    const { data } = await ApiSolicitacao.get("/solicitacao-folga");
    return data as SolicitacaoInterface[];

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const getAllSolicitacaoFolgaByUsuario = async (id: number) => {
  try {
    const { data } = await ApiSolicitacao.get(`/solicitacao-folga/usuario/${id}`);
    return data;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const getAllSolicitacaoFolgaBySetor = async (id: number) => {
  try {
    const { data } = await ApiSolicitacao.get(`/solicitacao-folga/setor/${id}`);
    return data;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const getSolicitacaoFolgaById = async (id: number): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const { data } = await ApiSolicitacao.get(`/solicitacao-folga/${id}`);
    return data as SolicitacaoInterface;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const createSolicitacaoFolga = async (formData: FormData): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const { data } = await ApiSolicitacao.post("/solicitacao-folga/cadastrar", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data as SolicitacaoInterface;

  } catch (error: any) {
    console.error("Erro na API:", error.response?.data || error.message);
    throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
  }
};



const updateSolicitacaoFolga = async (solicitacao: SolicitacaoInterface): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const status: Record<string, number> = {
      "PENDENTE": 0,
      "APROVADA": 1,
      "REPROVADA": 2
    }

    const updatedSolicitacaoFolga = { 
      ...solicitacao, 
      solicitacaoStatus: status[solicitacao.solicitacaoStatus] 
    }

    const { data } = await ApiSolicitacao.put("/solicitacao-folga/editar", updatedSolicitacaoFolga, {
      headers: { 'Content-Type': 'application/json' }
    })

    const solicitacaoFolgaModificada: SolicitacaoInterface = data as SolicitacaoInterface;
    return solicitacaoFolgaModificada;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const deleteSolicitacaoFolga = async (solicitacaoCod: number): Promise<SolicitacaoInterface | ApiException> => {
  try {
    console.log(`ID PARA DELETAR: ${solicitacaoCod}`);
    const { data } = await ApiSolicitacao.request({
      url: '/solicitacao-folga/deletar',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      data: { solicitacaoCod }
    });

    const solicitacaoFolgaDeletada: SolicitacaoInterface = data as unknown as SolicitacaoInterface;
    return solicitacaoFolgaDeletada;

  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

export const solicitacaoFolgaServices = {
  getAllSolicitacaoFolga,
  getSolicitacaoFolgaById,
  updateSolicitacaoFolga,
  deleteSolicitacaoFolga,
  createSolicitacaoFolga,
  getAllSolicitacaoFolgaByUsuario,
  getAllSolicitacaoFolgaBySetor
};
