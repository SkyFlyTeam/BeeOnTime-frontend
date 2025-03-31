import { ApiException } from "../config/apiExceptions";
import { ApiPonto } from "../config/apiPonto";

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

export const horasServices = {
    getHorasByUsuario
};
  