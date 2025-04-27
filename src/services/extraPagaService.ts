import { ApiBancoHoras } from "@/config/apiBancoHoras";
import { ApiException } from "@/config/apiExceptions";
import ExtrasPagas from "@/interfaces/extraPaga";

const getAllExtrasPagas = async (): Promise<ExtrasPagas[] | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get('/extras_pagas')
        return data as ExtrasPagas[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const getAllExtrasPagasById = async (id: number): Promise<ExtrasPagas | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/extras_pagas/${id}`)
        return data as ExtrasPagas
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}


const getExtrasPagasSaldoAtual = async (usuarioCod: number, date: string): Promise<ExtrasPagas | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/extras_pagas/saldoAtual/usuario/${usuarioCod}/data/${date}`)
        return data as ExtrasPagas
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const getAllBancoHorasByUsuario = async (usuarioCod: number): Promise<ExtrasPagas | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/extras_pagas/usuario/${usuarioCod}`)
        return data as ExtrasPagas
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const createExtraspagas = async (extraPaga: any): Promise<ExtrasPagas | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.post("/extras_pagas/cadastrar", extraPaga, {
            headers: { 'Content-Type': 'application/json' }
        })
        return data as ExtrasPagas
    } catch (error: any) {
        console.error("Erro na API:", error.response?.data || error.message);
        throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
      }
}

const updatedExtraPaga = async (extraPaga: ExtrasPagas): Promise<ExtrasPagas | ApiException> => {
    const { data } = await ApiBancoHoras.put('/extras_pagas/editar', extraPaga, {
        headers: { 'Content-Type': 'application/json' }
    })

    const bancoHorasModificada: ExtrasPagas = data as ExtrasPagas
    return bancoHorasModificada
}

const deleteExtrasPagas = async (extrasPagasCod: number) => {
    try {
        const { data } = await ApiBancoHoras.request({
            url: 'extras_pagas/deletar',
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            data: { extrasPagasCod }
        })

        const bancoHorasDeletada: ExtrasPagas = data as ExtrasPagas
        return bancoHorasDeletada
    } catch (error) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const extrasPagasServices = {
    getAllExtrasPagas,
    getAllExtrasPagasById,
    getExtrasPagasSaldoAtual,
    getAllBancoHorasByUsuario,
    createExtraspagas,
    updatedExtraPaga,
    deleteExtrasPagas
}