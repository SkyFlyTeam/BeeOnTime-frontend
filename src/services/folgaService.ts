import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import Folgas from "@/interfaces/folga";

const getAll = async (): Promise<Folgas[] | ApiException> => {
    try {
        const { data } = await ApiUsuario.get('/folgas')
        return data as Folgas[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar folgas.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

const getBySetor = async (setorCod: number): Promise<Folgas[] | ApiException> => {
    try {
        const { data } = await ApiUsuario.get(`/folgas/setor/${setorCod}`)
        return data as Folgas[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar folgas.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

export const folgaService = {
    getAll,
    getBySetor
}