import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import Folga from "@/interfaces/folga";

const getFolgaMonthByEmpresa = async (empCod: number, date: string) => {
    try {
        const { data } = await ApiUsuario.get(`/folgas/empresa/${empCod}/mes/${date}`)
        return data as Folga[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar horas do usuário.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

export const folgaServices = {
    getFolgaMonthByEmpresa
};