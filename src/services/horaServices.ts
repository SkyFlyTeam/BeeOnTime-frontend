import { ApiException } from "../config/apiExceptions";
import { Api } from "../config/apiHorasConfig";
import { Horas } from "../interfaces/horasInterface";

const getHora = async (usuarioCod: number, date: string | Date): Promise<Horas> => {
    try {
        const dateToSend = {
            "data": date
        }
        const { data } = await Api.post(`/horas/usuario/${usuarioCod}/dia`, dateToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        return data
    } catch (error: any) {
        console.error("Erro na API:", error.response?.data || error.message);
        throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
    }
}

export const horasServices = {
    getHora
  };