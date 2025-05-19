import { useState } from "react";

interface CardResumoMensalProps {
    acesso: 'adm' | 'func' | 'jornada'
}

export const CardResumoMensal = ({acesso} : CardResumoMensalProps) => {

    const [loading, setLoading] = useState(false);

    return(
        loading ? (
            <></>
        ) : (
            <>
                <div className="flex w-full flex-col gap-4 bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] rounded-xl p-6">
                    <h1 className="md:text-xl text-lg font-semibold self-center">{acesso == 'jornada' ? 'Informações' : 'Resumo Mensal'}</h1>
                    <div className="flex flex-col gap-2 md:text-base text-sm">
                        {
                            acesso == 'adm' ? (
                                <>
                                    <div>
                                        <span className="font-bold">Feriados: </span>
                                        <ul className="ml-10">
                                            <li className="list-disc">Dia 19 - Dia das mães</li>
                                            <li className="list-disc">Dia 01 - Dia da professora</li>
                                        </ul>
                                    </div>
                                    <span><b>Colaboradores com ausência:</b> 13 neste mês</span>
                                    <span><b>Colaboradores em férias:</b> 13 neste mês</span>
                                    <span><b>Colaboradores em folga:</b> 13 neste mês</span>
                                </>
                            ) : (
                                acesso == 'func' ? (
                                <>
                                    <div>
                                        <span className="font-bold">Feriados: </span>
                                        <ul className="ml-10">
                                            <li className="list-disc">Dia 19 - Dia das mães</li>
                                            <li className="list-disc">Dia 01 - Dia da professora</li>
                                        </ul>
                                    </div>
                                    <span><b>Ausências:</b> 13 neste mês</span>
                                    <span><b>Folgas:</b> 13 neste mês</span>
                                </>
                                ) : (
                                <>
                                    <div>
                                        <span className="font-bold">Feriados: </span>
                                        <ul className="ml-10">
                                            <li className="list-disc">Dia 19 - Dia das mães</li>
                                            <li className="list-disc">Dia 01 - Dia da professora</li>
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
            </>
        )
        
    )
}