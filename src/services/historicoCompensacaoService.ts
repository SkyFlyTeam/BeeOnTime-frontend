import { ApiBancoHoras } from "@/config/apiBancoHoras";
import { ApiException } from "@/config/apiExceptions";
import { HistoricoCompensacao } from "@/interfaces/bancoHoras";

const createHistCompesacao = async (histCompesancao: any): Promise<HistoricoCompensacao | ApiException> => {
    try {
        const { data } = await ApiBancoHoras.post("/historico_compensacao/cadastrar", histCompesancao, {
            headers: { 'Content-Type': 'application/json' }
        })
        return data as HistoricoCompensacao
    } catch (error: any) {
        console.error("Erro na API:", error.response?.data || error.message);
        throw new ApiException(error?.message || "Erro ao cadastrar solicitação.");
      }
}


export const HistoricoCompensacaoServices = {
    createHistCompesacao
}