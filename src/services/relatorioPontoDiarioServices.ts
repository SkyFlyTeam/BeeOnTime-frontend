import { ApiPonto } from "@/config/apiPonto";
import { ApiUsuario } from "@/config/apiUsuario";
import { Usuario } from "@/interfaces/usuario";
import { PontoDiario } from "@/interfaces/pontoDiario";
import HistPonto from "@/interfaces/histPonto";
import { pontoServices } from "./pontoServices";
import { faltaServices } from "./faltaService";
import { ApiException } from "@/config/apiExceptions";
import { solicitacaoServices } from "./solicitacaoServices";
import SolicitacaoInterface from "@/interfaces/Solicitacao";

export const relatorioPontoDiarioServices = {
    async getPontoDiarioGeral(data: string): Promise<PontoDiario[]> {
        try {
            console.log("data", data)
            const usuariosRes = await ApiUsuario.get("/usuario/usuarios");
            const usuarios = usuariosRes.data as Usuario[];

            const usuariosFiltrados = usuarios.filter(
                (u) => u.nivelAcesso.nivelAcesso_cod !== 0
            );

            const resultados: PontoDiario[] = [];

            for (const user of usuariosFiltrados) {
                let pontoData: HistPonto | null = null;

                try {
                    const pontoRes = await pontoServices.getPontosByUsuario(user.usuario_cod);
                    let pontosData = pontoRes as HistPonto[];
                    pontosData = pontosData.filter((ponto) => ponto.data == data)
                    console.log("filter", pontosData.filter((ponto) => ponto.data == data))
                    if (pontosData) {
                        pontoData = pontosData.at(0)!
                    } else {
                        pontoData = null
                    }

                } catch (err) {
                    pontoData = null;
                }

                console.log("pontoRes", pontoData)


                const falta = await faltaServices.getFaltabyUsuarioCodAndDate(user.usuario_cod, data);

                //Se a falta existir, pular para o próximo usuário
                if (falta && !(falta instanceof ApiException)) {
                    console.log(`Usuário ${user.usuario_nome} tem uma falta registrada para o dia ${data}`);

                    const ponto: PontoDiario = {
                        nome: user.usuario_nome || "-",
                        status: "Falta",
                        contratacao: `${user.usuarioTipoContratacao || "-"} - ${user.usuario_cargaHoraria || "-"}h`,
                        jornada: user.jornadas?.jornada_horarioEntrada && user.jornadas?.jornada_horarioSaida
                            ? `${user.jornadas.jornada_horarioEntrada.toString().slice(0, 5)} - ${user.jornadas.jornada_horarioSaida.toString().slice(0, 5)}`
                            : "-",
                        entrada: "-",
                        saida: "-",
                        intervaloInicio: "-",
                        intervaloVolta: "-",
                        data,
                        retorno: undefined,
                    };

                    resultados.push(ponto);
                    continue;
                }

                const solicitacoes = await solicitacaoServices.getAllSolicitacaoByUsuario(user.usuario_cod);

                if (!Array.isArray(solicitacoes)) {
                    console.warn(`Erro ao buscar solicitações do usuário ${user.usuario_nome}`)
                    continue
                }

                const solicitacoesAprovada = solicitacoes.filter(
                    (s: SolicitacaoInterface) => s.solicitacaoStatus == "APROVADA"
                )

                let tipoSolicitacaoNaData: string | null = null
                let retorno: string | undefined

                for (const solicitacao of solicitacoesAprovada) {
                    let datasSolicitadas: string[] = []

                    const periodo = solicitacao.solicitacaoDataPeriodo;
                    if (typeof periodo === "string") {
                        datasSolicitadas = periodo.split(",").map(d => d.trim())
                    }
                    //verificando se inclui a data atual
                    if (datasSolicitadas.includes(data)) {
                        tipoSolicitacaoNaData = solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome;

                        const ultimaData = datasSolicitadas.reduce((max, current) => {
                            return new Date(current) > new Date(max) ? current : max;
                        });
                        console.log('ULTIMADATA', ultimaData)
                        const [ano, mes, dia] = ultimaData.split("-").map(Number);
                        const retornoDate = new Date(ano, mes - 1, dia ); // mês começa do zero! //tirei 0 -1 no dia pois funcionou sem 
                        console.log(retornoDate)
                        retornoDate.setDate(retornoDate.getDate() + 1) // 
                        retorno = retornoDate.toLocaleDateString('pt-br', { day: '2-digit', month: '2-digit' })

                        break; //achou uma solicitação válida para esse dia
                    }
                }

                // let status = tipoSolicitacaoNaData
                // if (!status) {
                //     status = pontos.length > 0 ? "Presente" : "Ausência";
                // }




                const pontos = pontoData?.pontos ?? [];

                let entrada = "-", saida = "-", intervaloInicio = "-", intervaloVolta = "-";

                if (pontos.length > 0) {
                    const ordenados = [...pontos].sort(
                        (a, b) =>
                            new Date(a.horarioPonto as string).getTime() - new Date(b.horarioPonto as string).getTime()
                    );

                    let intervaloCount = 0;

                    for (const ponto of ordenados) {
                        const horario = ponto.horarioPonto?.toString().slice(0, 5) || "-";

                        switch (ponto.tipoPonto) {
                            case 0:
                                console.log("entrada", horario)
                                entrada = horario;
                                break;
                            case 1:
                                saida = horario;
                                break;
                            case 2:
                                if (intervaloCount === 0) {
                                    intervaloInicio = horario;
                                } else if (intervaloCount === 1) {
                                    intervaloVolta = horario;
                                }
                                intervaloCount++;
                                break;
                        }
                    }
                }

                let status = tipoSolicitacaoNaData
                if (!status) {
                    status = pontos.length > 0 ? "Presente" : "Ausência";
                }

                console.log(entrada, saida, intervaloInicio, intervaloVolta)

                const jornada = user.jornadas;
                const jornadaFormatada = jornada && jornada.jornada_horarioEntrada && jornada.jornada_horarioSaida
                    ? `${jornada.jornada_horarioEntrada?.toString().slice(0, 5) || "-"} - ${jornada.jornada_horarioSaida?.toString().slice(0, 5) || "-"}`
                    : "-";

                const contratacao = `${user.usuarioTipoContratacao || "-"} - ${user.usuario_cargaHoraria || "-"}h`;

                const ponto: PontoDiario = {
                    nome: user.usuario_nome || "-",
                    status, /*pontos.length === 0 ? "Ausente" : "Presente"*/
                    contratacao,
                    jornada: jornadaFormatada,
                    entrada,
                    saida,
                    intervaloInicio,
                    intervaloVolta,
                    data,
                    retorno,
                };

                resultados.push(ponto);
            }

            return resultados;
        } catch (err) {
            console.error("Erro ao obter dados de ponto diário", err);
            return [];
        }
    }
};