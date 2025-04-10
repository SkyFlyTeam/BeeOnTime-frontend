import { ApiException } from "@/config/apiExceptions";
import { ApiPonto } from "@/config/apiPonto";
import Horas from "@/interfaces/horas";

const getHorasByUsuarioAndDate = async (usuario_cod: number, date: string) => {
    try {
        const { data } = await ApiPonto.post(`/horas/usuario/${usuario_cod}/dia?data=${date}`)
        return data as Horas
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar horas do usuário.");
        }
        return new ApiException("Erro desconhecido.");
    }
}

const getHorasByUsuario = async (usuarioCod: number): Promise<Horas[] | ApiException> => {
  try {
    const { data } = await ApiPonto.get(`/horas/usuario/${usuarioCod}`);
    return data as Horas[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar horas do usuário.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

export const horasServices = {
    getHorasByUsuarioAndDate,
    getHorasByUsuario
}; 