import axios from "axios";
import { ApiException } from "../config/apiExceptions";
import { Api } from "../config/apiPontoConfig";
import PontoProv, { AprovarPonto } from "../interfaces/pontoProv";

const createSolicitacaoPonto = async (ponto: PontoProv) => {
    try {
        const { data } = await Api.post('/mpontoprov/cadastrar', ponto, {
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
        const { data } = await Api.get(`/mpontoprov/solicitacao/${solicitacao_cod}`)

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
        const { data } = await Api.post(`/mpontoprov/decisao/${solicitacaoCod}`, idPonto,{
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

export const pontoServices = {
    createSolicitacaoPonto,
    getSolicitacaoPonto,
    aproveSolicitacaoPonto
  };
  