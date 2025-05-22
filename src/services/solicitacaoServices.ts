import { ApiException } from "../config/apiExceptions";
import { ApiSolicitacao } from "../config/apiSolicitacao";
// import SolicitacaoInterface, { EnviarSolciitacaoInterface } from "../interfaces/Solicitacao";
import SolicitacaoInterface, { CriarSolicitacaoInterface } from "../interfaces/Solicitacao";


const getAllSolicitacao = async (): Promise<SolicitacaoInterface[] | ApiException> => {
  try {
    const { data } = await ApiSolicitacao.get("/solicitacao");
    return data as SolicitacaoInterface[];

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const getAllSolicitacaoByUsuario = async (id: number) => {
  try {
    const { data } = await ApiSolicitacao.get(`/solicitacao/usuario/${id}`);
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
    const { data } = await ApiSolicitacao.get(`/solicitacao/setor/${id}`);
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
    const { data } = await ApiSolicitacao.get(`/solicitacao/${id}`);
    return data as SolicitacaoInterface;

  } catch (error: unknown) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }

    return new ApiException("Erro desconhecido.");
  }
};

const createSolicitacao = async (formData: FormData): Promise<SolicitacaoInterface | ApiException> => {
  try {
    let objectFormData:Record<string, any> = {}

    for (let i of formData.entries()) {
      objectFormData[i[0]] = i[1]; 
    }

    const jsonString = objectFormData["solicitacaoJson"];
    const dataSolicitacao = JSON.parse(jsonString);

    const solicitacaoDataPeriodo = dataSolicitacao["solicitacaoDataPeriodo"];
    const usuarioCod = dataSolicitacao["usuarioCod"];
    const tipoSolicitacaoCod = dataSolicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod;

    console.log(solicitacaoDataPeriodo, usuarioCod, tipoSolicitacaoCod);

    const solicitacoes = await getAllSolicitacaoByUsuario(usuarioCod);

    if (solicitacoes instanceof ApiException) {
      throw solicitacoes; // ou trate de outra forma
    }
    
    const solicitacoesExistentes = solicitacoes as any[];

    // 2. Verificar se já existe uma solicitação do mesmo tipo e mesma data
    const jaExiste = solicitacoesExistentes.some((sol: any) => {
      const mesmaData = sol.solicitacaoDataPeriodo === solicitacaoDataPeriodo;
      const mesmoTipo = sol.tipoSolicitacaoCod?.tipoSolicitacaoCod === tipoSolicitacaoCod;
      return mesmaData && mesmoTipo;
    });
        
    if (jaExiste) {
      throw new ApiException("Já existe uma solicitação do mesmo tipo neste dia.");
    }

    const { data } = await ApiSolicitacao.post("/solicitacao/cadastrar", formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data as SolicitacaoInterface;

  } catch (error: any) {
    console.error("Erro na API:", error.response?.data || error.message);
    throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
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

    const { data } = await ApiSolicitacao.put("/solicitacao/editar", updatedSolicitacao, {
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
    const { data } = await ApiSolicitacao.request({
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

export const solicitacaoServices = {
  getAllSolicitacao,
  getSolicitacaoById,
  updateSolicitacao,
  deleteSolicitacao,
  createSolicitacao,
  getAllSolicitacaoByUsuario,
  getAllSolicitacaoBySetor
};
