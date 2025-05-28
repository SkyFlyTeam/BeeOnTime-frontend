import { ApiNotificacao } from "@/config/apiNotificacao";
import { ApiException } from "../config/apiExceptions";
// import SolicitacaoInterface, { EnviarSolciitacaoInterface } from "../interfaces/Solicitacao";
import SolicitacaoInterface, { CriarSolicitacaoInterface } from "../interfaces/Solicitacao";
import NotificacaoInterface from "@/interfaces/notificacao";


const getAllNotificacao = async (): Promise<NotificacaoInterface[] | ApiException> => {
  try {
    const { data } = await ApiNotificacao.get("/alerta");
    return data as NotificacaoInterface[];

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const getAllSolicitacaoByUsuario = async (id: number) => {
  try {
    const { data } = await ApiNotificacao.get(`/solicitacao/usuario/${id}`);
    return data;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const getAllSolicitacaoBySetor = async (id: number) => {
  try {
    const { data } = await ApiNotificacao.get(`/solicitacao/setor/${id}`);
    return data;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const getSolicitacaoById = async (id: number): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const { data } = await ApiNotificacao.get(`/alerta/${id}`);
    return data as SolicitacaoInterface;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const createNotificacao = async (notificacao: NotificacaoInterface): Promise<NotificacaoInterface | ApiException> => {
  try {
    const { data } = await ApiNotificacao.post("/alerta", notificacao);
    return data as NotificacaoInterface;

  } catch (error: any) {
    console.error("Erro na API:", error.response?.data || error.message);
    throw new ApiException(error?.message || "Erro ao cadastrar notificação.");
  }
};



const updateSolicitacao = async (solicitacao: SolicitacaoInterface): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const status: Record<string, number> = {
      "PENDENTE": 0,
      "APROVADA": 1,
      "REPROVADA": 2
    }

    const updatedSolicitacao = { 
      ...solicitacao, 
      solicitacaoStatus: status[solicitacao.solicitacaoStatus] 
    }

    const { data } = await ApiNotificacao.put("/solicitacao/editar", updatedSolicitacao, {
      headers: { 'Content-Type': 'application/json' }
    })

    const solicitacaoModificada: SolicitacaoInterface = data as SolicitacaoInterface;
    return solicitacaoModificada;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

const deleteSolicitacao = async (solicitacaoCod: number): Promise<SolicitacaoInterface | ApiException> => {
  try {
    console.log(`ID PARA DELETAR: ${solicitacaoCod}`);
    const { data } = await ApiNotificacao.request({
      url: '/solicitacao/deletar',
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      data: { solicitacaoCod }
    });

    const solicitacaoDeletada: SolicitacaoInterface = data as unknown as SolicitacaoInterface;
    return solicitacaoDeletada;

  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

export const notificacaoServices = {
  getAllNotificacao,
  getSolicitacaoById,
  updateSolicitacao,
  deleteSolicitacao,
  createNotificacao,
  getAllSolicitacaoByUsuario,
  getAllSolicitacaoBySetor
};
