
import { ApiException } from "../config/apiExceptions";
import { ApiPonto } from "../config/apiPontoConfig";
import PontoProv, { AprovarPonto } from "../interfaces/pontoProv";

const createSolicitacaoPonto = async (ponto: PontoProv) => {
    try {
        const { data } = await ApiPonto.post('/mpontoprov/cadastrar', ponto, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
        return data
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getSolicitacaoPonto = async (solicitacao_cod: number) => {
    try {
        const { data } = await ApiPonto.get(`/mpontoprov/solicitacao/${solicitacao_cod}`)

        return data 
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getPontosByUsuario = async (usuario_cod: number) => {
    try {
        const { data } = await ApiPonto.get(`/mpontos/usuario/${usuario_cod}`)


        return data 
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const aproveSolicitacaoPonto = async (idPonto: AprovarPonto, solicitacaoCod: number) => {
    try {
        const { data } = await ApiPonto.post(`/mpontoprov/decisao/${solicitacaoCod}`, idPonto,{
        })
        return data
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const pontoServices = {
    createSolicitacaoPonto,
    getSolicitacaoPonto,
    getPontosByUsuario,
    aproveSolicitacaoPonto
  };

  