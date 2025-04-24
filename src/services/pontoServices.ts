
import HistPontos, { Ponto } from "@/interfaces/hisPonto";
import { ApiException } from "../config/apiExceptions";
import { ApiPonto } from "../config/apiPonto";
import PontoProv, { AprovarPonto } from "../interfaces/pontoProv";

const baterPonto = async (usuario_cod: number, horasCod: number, ponto: Ponto) => {
    try {
        const estrutura_ponto = {
            "usuarioCod": usuario_cod,
            "horasCod": horasCod,
            "pontos": [ponto]
        }

        const { data } = await ApiPonto.post('/mpontos/baterPonto', estrutura_ponto)
        return data
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getPontosByHorasCod = async (horasCod: number) => {
    try {

        const { data } = await ApiPonto.get(`/mpontos/porHorasCod/${horasCod}`)
        return data as HistPontos
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const createSolicitacaoPonto = async (ponto: PontoProv) => {
    try {
        const { data } = await ApiPonto.post('/mpontoprov/cadastrar', ponto, {
            headers: {
                'Content-Type': 'application/json',
            }
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
        // console.log(`PONTOOOOO: ${data}`)
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
        const { data } = await ApiPonto.post(`/mpontoprov/decisao/0`, idPonto,{
            headers: {
                'Content-Type': 'application/json',
            }
        })
        console.log(data)
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
    baterPonto,
    getPontosByHorasCod,
    getSolicitacaoPonto,
    getPontosByUsuario,
    aproveSolicitacaoPonto
  };

  