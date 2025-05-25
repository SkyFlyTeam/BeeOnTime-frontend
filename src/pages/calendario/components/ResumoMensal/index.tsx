import Faltas from "@/interfaces/faltas";
import { Feriado } from "@/interfaces/feriado";
import Folgas from "@/interfaces/folga";
import Horas from "@/interfaces/horas";
import { Usuario } from "@/interfaces/usuario";
import { horasServices } from "@/services/horasService";
import { createDateFromString } from "@/utils/functions/createDateFromString";
import { verifyWorkDay } from "@/utils/functions/verifyWorkDay";
import { isSameMonth } from "date-fns";
import { useEffect, useMemo, useState } from "react";

interface CardResumoMensalProps {
    acesso: 'adm' | 'func' | 'jornada'
    usuarioCod: number
    feriados: Feriado[];
    dataCalendario: Date;
    dadosMes: {
        ferias?: Folgas[];
        faltas?: Faltas[];
        folgas?: Folgas[];
    } | null | undefined;
    funcInfo?: Usuario;
}

type Dados = {
    faltas: number,
    folgas: number,
    ferias: number
}

export const CardResumoMensal = ({acesso, usuarioCod, feriados, dataCalendario, dadosMes, funcInfo} : CardResumoMensalProps) => {

    const [feriadosMes, setFeriadosMes] = useState<Feriado[] | null>(null);

    const [dados, setDados] = useState<Dados | null>(null);

    const [funcHorasSem, setFuncHorasSem] = useState<number>(0);
    const [funcFolgasDias, setFuncFolgasDias] = useState<number>(0);
    const [funcHoras, setFuncHoras] = useState<Horas[] | null>(null);
    const [funcDiasExtras, setFuncDiasExtras] = useState<number>(0);

    useEffect(() => {
       // Filtra apenas os feriados no mesmo mês
        const feriados_filtrado_mes = feriados.filter((feriado) => {
            const [anoString, mesString, diaString] = (feriado.feriadoData as string).split('-');
            const feriado_data = new Date(Number(anoString), Number(mesString) - 1, Number(diaString));
            return isSameMonth(feriado_data, dataCalendario);
        });

        const feriados_formatados = feriados_filtrado_mes.map((feriado) => {
            const [anoString, mesString, diaString] = (feriado.feriadoData as string).split('-');
            const feriado_data = new Date(Number(anoString), Number(mesString) - 1, Number(diaString));

            return {
                feriadoData: feriado_data,
                feriadoNome: feriado.feriadoNome,
                feriadoCod: feriado.feriadoCod,
                empCod: feriado.empCod,
            } as Feriado;
        });
        setFeriadosMes(feriados_formatados);
    }, [feriados, dataCalendario])

    useMemo(() => {
        if(acesso == 'adm'){
            function filtrarUnicoPorUsuarioCod(arr: { usuarioCod: number }[]) {
                const map = new Map<number, any>();

                for (const item of arr) {
                    if (!map.has(item.usuarioCod)) {
                    map.set(item.usuarioCod, item);
                    }
                }

                return Array.from(map.values());
            }
            const formatted_dados: Dados = {
                faltas: dadosMes?.faltas ? filtrarUnicoPorUsuarioCod(dadosMes?.faltas).length : 0,
                folgas: dadosMes?.folgas ? filtrarUnicoPorUsuarioCod(dadosMes?.folgas).length : 0,
                ferias: dadosMes?.ferias ? filtrarUnicoPorUsuarioCod(dadosMes?.ferias).length : 0
            }
            setDados(formatted_dados);
        }else{
            let faltas = dadosMes?.faltas?.filter((falta) => falta.usuarioCod == usuarioCod);
            let folgas = dadosMes?.folgas?.filter((folga) => folga.usuarioCod == usuarioCod);
            let ferias = dadosMes?.ferias?.filter((ferias) => ferias.usuarioCod == usuarioCod).flatMap(f => f.folgaDataPeriodo as string[]);
            let feriasDias = Array.from(new Set(ferias));

            if(funcInfo && dadosMes?.folgas){
                folgas = dadosMes?.folgas?.filter((folga) => folga.usuarioCod == funcInfo.usuario_cod);
                let folgas_dias = Array.from(new Set(folgas!.flatMap(f => f.folgaDataPeriodo as string[])));
                setFuncFolgasDias(folgas_dias.length);
            }

            const formatted_dados: Dados = {
                faltas: faltas ? faltas.length : 0,
                folgas: folgas ? folgas.length : 0,
                ferias: ferias ? feriasDias.length : 0
            }
            setDados(formatted_dados);
        }
    }, [dadosMes, acesso])

    const calculateFuncHorasSemanal = () => {
         if (funcInfo) {
            const dias_trabalhados = funcInfo.jornadas.jornada_diasSemana
            let total_dias_trabalhados = 0

            dias_trabalhados.forEach((dia) => {
                if(dia){
                    total_dias_trabalhados += 1
                }
            })
            
            return total_dias_trabalhados * funcInfo.usuario_cargaHoraria;
        }
        return 0;
    }

    useEffect(() => {
        if(funcInfo){
            let horas = calculateFuncHorasSemanal()
            setFuncHorasSem(horas);
            fetchUsuarioHoras(funcInfo.usuario_cod);
        }
    }, [funcInfo])

    const fetchUsuarioHoras = async (funcCod: number) => {
        try{
            const horas = await horasServices.getHorasByUsuario(funcCod);
            setFuncHoras(horas as Horas[])
        }catch(e){
            console.error('Erro ao pegar horas do funcionário', e)
        }
    }

    const calculateFuncDiasExtras = (horas: Horas[], func: Usuario) => {
        /* dias fora da jornada de trabalho */
        // Usar um Set para evitar contar datas repetidas
        const diasForaJornada = new Set<string>();

        horas.forEach(hora => {
            // Verifica se é dia de trabalho esperado
            const trabalhouNoDia = true; // pressupõe que o registro indica que trabalhou nesse dia

            if (trabalhouNoDia) {
                let data = createDateFromString(hora.horasData as string)
                const estaNaJornada = verifyWorkDay(func, data);

                if (!estaNaJornada) {
                    diasForaJornada.add(hora.horasData as string);
                }
            }
        })
        return diasForaJornada.size;
    }

    useEffect(() => {
        if(funcHoras && funcInfo){
            const diasExtras = calculateFuncDiasExtras(funcHoras, funcInfo);
            setFuncDiasExtras(diasExtras);
        }
    }, [funcHoras])

    return(
        <div className="flex w-full flex-col gap-4 bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] rounded-xl p-6">
            <h1 className="md:text-xl text-lg font-semibold self-center">{acesso == 'jornada' ? 'Informações' : 'Resumo Mensal'}</h1>
            <div className="flex flex-col gap-2 md:text-base text-sm">
                {
                    acesso == 'adm' ? (
                        <>
                            <div>
                                <span className="font-bold">Feriados: </span>
                                <ul className="ml-10">
                                    {feriadosMes?.map((feriado) => (
                                            <li className="list-disc">Dia {(feriado.feriadoData as Date).getDate().toString().padStart(2, '0')} - {feriado.feriadoNome}</li>
                                    ))}
                                </ul>
                            </div>
                            <span><b>Colaboradores com ausência:</b> {dados?.faltas ? dados?.faltas : '-' } neste mês</span>
                            <span><b>Colaboradores em férias:</b> {dados?.ferias ? dados.ferias : '-'} neste mês</span>
                            <span><b>Colaboradores em folga:</b> {dados?.folgas ? dados.folgas : '-'} neste mês</span>
                        </>
                    ) : (
                        acesso == 'func' ? (
                        <>
                            <div>
                                <span className="font-bold">Feriados: </span>
                                <ul className="ml-10">
                                    {feriadosMes?.map((feriado) => (
                                            <li className="list-disc">Dia {(feriado.feriadoData as Date).getDate().toString().padStart(2, '0')} - {feriado.feriadoNome}</li>
                                    ))}
                                </ul>
                            </div>
                            <span><b>Ausências:</b> {dados?.faltas ? dados?.faltas : '-' } neste mês</span>
                            <span><b>Folgas:</b> {dados?.folgas ? dados.folgas : '-'} neste mês</span>
                            <span><b>Período de Férias:</b> {dados?.ferias ? dados.ferias : '-'} dias</span>
                        </>
                        ) : (
                        <>
                            <div>
                                <span className="font-bold">Feriados: </span>
                                <ul className="ml-10">
                                    {feriadosMes?.map((feriado) => (
                                            <li className="list-disc">Dia {(feriado.feriadoData as Date).getDate().toString().padStart(2, '0')} - {feriado.feriadoNome}</li>
                                    ))}
                                </ul>
                            </div>
                            <span><b>Carga horária semanal:</b> {funcHorasSem}h / semana</span>
                            <span><b>Folgas programadas:</b> {funcFolgasDias} dias neste mês</span>
                            <span><b>Dias trabalhados fora do padrão:</b> {funcDiasExtras} dias</span>
                        </>
                        )
                    )
                }

            </div>
        </div>
    )
}