import { ApiUsuario } from "@/config/apiUsuario";
import { ApiException } from "../config/apiExceptions";

const getUsuarioById = async (usuario_cod: number) => {
    try {
        const { data } = await ApiUsuario.get(`/usuario/${usuario_cod}`)
        return data 
    } catch (error) {
        if (error instanceof Error) {
        return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const usuarioServices = {
    getUsuarioById
};
  