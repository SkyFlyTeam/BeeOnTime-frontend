import { ApiException } from "@/config/apiExceptions";
import { ApiPonto } from "@/config/apiPonto";
import Faltas from "@/interfaces/faltas";

const getFaltabyUsuarioCodAndDate = async (usuario_cod: number, date: string) => {
    try {
        const { data } = await ApiPonto.get(`/faltas/${usuario_cod}/dia?data=${date}`)
        return data as Faltas
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar horas do usuário.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

const getFaltasMonthByEmpresa = async (empCod: number, date: string) => {
    try {
        const { data } = await ApiPonto.get(`/faltas/empresa/${empCod}/mes/${date}`)
        return data as Faltas[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar horas do usuário.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

const updateFalta = async(faltaCod: number, justificativa: string) => {
    try {
        const { data } = await ApiPonto.put(`/faltas/atualizar`, {
            faltaCod: faltaCod,
            faltaJustificativa: justificativa
        })
        return new ApiException("Faltas atualizadas com sucesso")
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar horas do usuário.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

export const faltaServices = {
    getFaltabyUsuarioCodAndDate,
    getFaltasMonthByEmpresa,
    updateFalta
}