import { ApiException } from "../config/apiExceptions";
import { Api } from "../config/apiHorasConfig";
import { Horas } from "../interfaces/horasInterface";

const getHora = async (usuarioCod: number, date: string | Date): Promise<Horas> => {
    try {
        // Transformar a data para string
        const dataFormatada = date instanceof Date ? date.toISOString().split('T')[0] : date;

        // Enviar a requisição com a data na URL
        const { data } = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${dataFormatada}`);

        return data
    } catch (error: any) {
        console.error("Erro na API:", error.response?.data || error.message);
        throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
    }
}

export const horasServices = {
    getHora
  };