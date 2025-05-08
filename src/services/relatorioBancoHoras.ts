import { ApiBancoHoras } from "@/config/apiBancoHoras";
import { ApiException } from "../config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import { ApiPonto } from "@/config/apiPonto";
import { bancoDiarioResponse, bancoHorasDiarioFunc, bancoHorasMensalAdmin, bancoHorasMensalFunc, bancoMensalAdminResponse, horasDiarioResponse, horasMensalAdminResponse } from "@/interfaces/bancoHoras";
import { Usuario } from "@/interfaces/usuario";
import { calculateUserCargaMensal } from "@/utils/functions/calculateUserCargaMensal";
import { verifyWorkDay } from "@/utils/functions/verifyWorkDay";

const getRelatorioMensalAdmin = async (date: String) => {
    try {
        const bancoResponse = await ApiBancoHoras.get(`/relatorio/mensal/${date}`);
        const usuariosResponse = await ApiUsuario.get(`/usuario/usuarios`)
        const pontoResponse = await ApiPonto.get(`/relatorio/mensal/${date}`)

        const bancoData = bancoResponse.data as bancoMensalAdminResponse[];
        const usuariosData = usuariosResponse.data as Usuario[];
        const pontoData = pontoResponse.data as horasMensalAdminResponse[];

        const usuariosFiltrados = usuariosData.filter((usuario) => usuario.nivelAcesso.nivelAcesso_cod != 0)

        const relatorioMensal: bancoHorasMensalAdmin[] = usuariosFiltrados.map(usuario => {
            // Encontrar os dados correspondentes do banco de horas e ponto
            const banco = bancoData.find(b => b.usuarioCod === usuario.usuario_cod);
            const ponto = pontoData.find(p => p.usuarioCod === usuario.usuario_cod);

            // Se não encontrar, define valores padrão como 0
            return {
                usuarioCod: usuario.usuario_cod,
                usuarioNome: usuario.usuario_nome,
                dataMes: date as string,
                totalHoras: ponto ? ponto.horasTotal : 0,
                horasContratuais: calculateUserCargaMensal(usuario),
                desconto: ponto ? ponto.desconto : 0,
                horasAbonadas: banco ? banco.horasAbonadas : 0,
                extrasPagas: banco ? banco.extrasPagas : 0,
                saldoAcumulado: banco ? banco.saldoAcumulado : 0
            };
        });

        return relatorioMensal;
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getRelatorio6MesesFunc = async (date: String, usuario: Usuario) => {
    try {
        const bancoResponse = await ApiBancoHoras.get(`/relatorio/mensal/${date}/usuario/${usuario.usuario_cod}`);
        const pontoResponse = await ApiPonto.get(`/relatorio/mensal/${date}/usuario/${usuario.usuario_cod}`)

        const bancoData = bancoResponse.data as bancoDiarioResponse[];
        const pontoData = pontoResponse.data as horasDiarioResponse[];

        // Combina os dados de banco e ponto, agrupando pela data
        const relatorioMensal: bancoHorasMensalFunc[] = bancoData.map((banco) => {
            const horas = pontoData.find(p => p.data === banco.data);

            return {
                usuarioCod: banco.usuarioCod,
                mesAno: banco.data,
                totalHoras: horas ? horas.horasTotal : 0,
                horasContratuais: calculateUserCargaMensal(usuario),  
                desconto: horas ? horas.desconto : 0,
                horasAbonadas: banco.horasAbonadas,
                extrasPagas: banco.extrasPagas,
                saldoAcumulado: banco.saldoAcumulado
            };
        });

        return relatorioMensal;
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

const getRelatorioDiarioFunc = async (date: string, usuario: Usuario) => {
    try {
        const bancoResponse = await ApiBancoHoras.get(`/relatorio/diario/${date}/usuario/${usuario.usuario_cod}`);
        const pontoResponse = await ApiPonto.get(`/relatorio/diario/${date}/usuario/${usuario.usuario_cod}`)

        const bancoData = bancoResponse.data as bancoDiarioResponse[];
        const pontoData = pontoResponse.data as horasDiarioResponse[];

        // Combina os dados de banco e ponto, agrupando pela data
        const relatorioMensal: bancoHorasDiarioFunc[] = bancoData.map((banco) => {
            const horas = pontoData.find(p => p.data === banco.data);
            let isDiaTrabalhado = verifyWorkDay(usuario, banco.data)
            return {
                usuarioCod: banco.usuarioCod,
                data: banco.data,
                totalHoras: isDiaTrabalhado ? (horas ? horas.horasTotal : 0) : -1,
                horasContratuais: isDiaTrabalhado ? usuario.usuario_cargaHoraria : -1,  
                desconto: horas ? horas.desconto : 0,
                horasAbonadas: banco.horasAbonadas,
                extrasPagas: banco.extrasPagas,
                saldoAcumulado: banco.saldoAcumulado
            };
        });

        return relatorioMensal;
    } catch (error: unknown) {
        if (error instanceof Error) {
          return new ApiException(error.message || "Erro ao consultar a API.");
        }
    
        return new ApiException("Erro desconhecido.");
    }
}

export const relatorioBancoHorasServices = {
    getRelatorioMensalAdmin,
    getRelatorioDiarioFunc,
    getRelatorio6MesesFunc
  };

  