import { ApiBancoHoras } from "@/config/apiBancoHoras";
import { ApiException } from "@/config/apiExceptions";
import { BancoHoras } from "@/interfaces/bancoHoras";



const getAllBancoHoras = async (): Promise<BancoHoras[] | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get('/banco_horas')
        return data as BancoHoras[]
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const getAllBancoHorasById = async (id: number): Promise<BancoHoras | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/banco_horas/${id}`)
        return data as BancoHoras
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const getBancoHorasSaldoAtual = async (usuarioCod: number, date: string): Promise<BancoHoras | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/banco_horas/saldoAtual/usuario/${usuarioCod}/data/${date}`)
        return data as BancoHoras
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const getAllBancoHorasByUsuario = async (usuarioCod: number): Promise<BancoHoras | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.get(`/banco_horas/usuario/${usuarioCod}`)
        return data as BancoHoras
    } catch (error) {
        if (error instanceof Error) {
            return new ApiException(error.message || "Erro ao consultar a API.");
        }
      
        return new ApiException("Erro desconhecido.");
    }
}

const createBancoHoras = async (bancoHoras: any): Promise<BancoHoras | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.post("/banco_horas/cadastrar", bancoHoras, {
            headers: { 'Content-Type': 'application/json' }
        })
        return data as BancoHoras
    } catch (error: any) {
        console.error("Erro na API:", error.response?.data || error.message);
        throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
      }
}

const updatedBancoHoras = async (bancoHoras: BancoHoras): Promise<BancoHoras | ApiException> => {
    const { data } = await ApiBancoHoras.put('/banco_horas/editar', bancoHoras, {
        headers: { 'Content-Type': 'application/json' }
    })

    const bancoHorasModificada: BancoHoras = data as BancoHoras
    return bancoHorasModificada
}

const deleteBancoHoras = async (bancoHorasCod: number) => {
    try {
        const { data } = await ApiBancoHoras.request({
            url: 'banco_horas/deletar',
            method: 'DELETE',
            headers: {'Content-Type': 'application/json'},
            data: { bancoHorasCod }
        })

        const bancoHorasDeletada: BancoHoras = data as BancoHoras
        return bancoHorasDeletada
    } catch (error) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const bancoHorasServices = {
    getAllBancoHoras,
    getAllBancoHorasById,
    getBancoHorasSaldoAtual,
    getAllBancoHorasByUsuario,
    createBancoHoras,
    updatedBancoHoras,
    deleteBancoHoras
}