import { ApiEspelhoPonto } from "@/config/apiEspelhoPonto"
import { ApiException } from "@/config/apiExceptions"
import EspelhoPonto from "@/interfaces/espelhoPonto"

const getAllEspelhoPonto = async (): Promise<EspelhoPonto[] | ApiException> => {
        try {
            const { data } = await ApiEspelhoPonto.get('/espelho-ponto')
            return data as EspelhoPonto[]
        } catch (error) {
            if (error instanceof Error) {
                return new ApiException(error.message || "Erro ao consultar a API.");
            }
          
            return new ApiException("Erro desconhecido.");
        }
}

const getAllEspelhoPontoById = async (id: number): Promise<EspelhoPonto[] | ApiException> => {
    try {
        const { data } = await ApiEspelhoPonto.get(`/espelho-ponto/usuario/${id}`)
        return data as EspelhoPonto[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const updatedEspelhoPonto = async (espelhoPonto: EspelhoPonto): Promise<EspelhoPonto | ApiException> => {
    const { data } = await ApiEspelhoPonto.put('/espelho-ponto/editar', espelhoPonto, {
        headers: { 'Content-Type': 'application/json' }
    })

    const bancoHorasModificada: EspelhoPonto = data as EspelhoPonto
    return bancoHorasModificada
}

const generateEspelhoPontoPDF = async (usuarioCod: number, espelhoPontoCod: number): Promise<Blob | ApiException> => {
  try {
    const { data } = await ApiEspelhoPonto.get(`/espelho-ponto/generate-pdf/${usuarioCod}/${espelhoPontoCod}`, {
      responseType: 'blob'  // Specify the response type as 'blob' for the PDF file
    });

    // Return the PDF Blob if successful
    return data as Blob;
  } catch (error) {
    // If there's an error, return it as ApiException
    return error as ApiException;
  }
};

export const espelhoPontoService = {
    getAllEspelhoPonto,
    getAllEspelhoPontoById,
    updatedEspelhoPonto,
    generateEspelhoPontoPDF
}