import Faltas from "@/interfaces/faltas";
import { Feriado } from "@/interfaces/feriado";
import Folgas from "@/interfaces/folga";
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
}

type Dados = {
    faltas: number,
    folgas: number,
    ferias: number
}

export const CardResumoMensal = ({acesso, usuarioCod, feriados, dataCalendario, dadosMes} : CardResumoMensalProps) => {

    const [feriadosMes, setFeriadosMes] = useState<Feriado[] | null>(null);

    const [dados, setDados] = useState<Dados | null>(null);

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

            const formatted_dados: Dados = {
                faltas: faltas ? faltas.length : 0,
                folgas: folgas ? folgas.length : 0,
                ferias: ferias ? feriasDias.length : 0
            }
            setDados(formatted_dados);
        }
    }, [dadosMes, acesso])


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
                            <span><b>Carga horária semanal:</b> 44h / semana</span>
                            <span><b>Folgas programadas:</b> 8 dias neste mês</span>
                            <span><b>Dias trabalhados fora do padrão:</b> 12 dias</span>
                        </>
                        )
                    )
                }

            </div>
        </div>
    )
}