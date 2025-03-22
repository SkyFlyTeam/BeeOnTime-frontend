import { ApiException } from "../config/apiExceptions";
import { Api } from "../config/apiSolicitacaoConfig";
import SolicitacaoInterface from "../interfaces/Solicitacao";

const getAllSolicitacao = async (): Promise<SolicitacaoInterface[] | ApiException> => {
  try {
    const { data } = await Api.get("/solicitacao");
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const getSolicitacaoById = async (id: number): Promise<SolicitacaoInterface | ApiException> => {
  try {
    const { data } = await Api.get(`/solicitacao/${id}`);
    return data;
  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
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

    const { data } = await Api.put("/solicitacao/editar", updatedSolicitacao, {
      headers: { 'Content-Type': 'application/json' }
    })

    const solicitacaoModificada: SolicitacaoInterface = data;
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
    console.log(`ID PARA DELETAR: ${solicitacaoCod}`)
    const { data } = await Api.delete('/solicitacao/deletar', {
      headers: { 'Content-Type': 'application/json' },
      data: { solicitacaoCod: solicitacaoCod }
    })

    const solicitacaoDeletada: SolicitacaoInterface = data;
    return solicitacaoDeletada;

  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
}

export const solicitacaoServices = {
  getAllSolicitacao,
  getSolicitacaoById,
  updateSolicitacao,
  deleteSolicitacao,
};
