import Horas, { HorasDTO } from "@/interfaces/horas";
import { ApiException } from "../config/apiExceptions";
import { ApiPonto } from "../config/apiPonto";

const getPontuais = async (): Promise<HorasDTO[] | ApiException> => {
    try {
        const response = await ApiPonto.get<HorasDTO[]>("/horas/pontuais");
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getHorasByUsuario = async (usuario_cod: number) => {
    try {
        const { data } = await ApiPonto.get(`/horas/usuario/${usuario_cod}`)
        return data 
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getHorasByUsuarioAndDate = async (usuario_cod: number, date: string) => {
    try {
        const { data } = await ApiPonto.post(`/horas/usuario/${usuario_cod}/dia?data=${date}`)
        return data as Horas
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const generateHours = async () => {
    try {
        const { data } = await ApiPonto.get(`/horas/gerarRegistros`)
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const horasServices = {
    getHorasByUsuario,
    getHorasByUsuarioAndDate,
    generateHours,
    getPontuais
};
  