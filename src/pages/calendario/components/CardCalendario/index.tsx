import { SetStateAction, useEffect, useMemo, useRef, useState } from "react";

import { Calendar } from "@/components/ui/calendar";

import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DayProps, useDayRender } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Arrow } from "@radix-ui/react-tooltip";
import ModalResumoDia from "@/components/custom/ModaisCalendario/ModalResumoDia";

import { addMonths, isBefore, isSameDay, startOfDay, subMonths } from 'date-fns';
import ModalDefinirFolgaGeral from "@/components/custom/ModaisCalendario/ModalDefinirFolgaGeral";
import { Feriado } from "@/interfaces/feriado";
import Faltas from "@/interfaces/faltas";
import Folga from "@/interfaces/folga";



interface CardCalendarioProps {
    funcCalendar: boolean;
    empCod: number;
    usuarioCod: number;
    feriados: Feriado[];
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    currentDate: Date;
    dadosMes?: {
        ferias?: any[];
        faltas?: Faltas[];
        folgas?: Folga[];
    } | null;
}

const eventColorClasses: Record<string, string> = {
  ferias: "bg-[#95e1d8] text-[#5e9091]",
  ausencia: "bg-[#FFAAAA] text-[#AA4846]",
  folga: "bg-[#d1a0f5] text-[#7c559a]",
};

type MarkedDay =
  | { day: Date; events: { tipo: string; contagem: number }[] }
  | { day: Date; event: string };

export const CardCalendario = ({ funcCalendar, empCod, usuarioCod, feriados, currentDate, setCurrentDate, dadosMes }: CardCalendarioProps) => {
    const [formattedFeriados, setFormattedFeriados] = useState<Date[] | undefined>(undefined);
    
    const [selectedDate, setSelectedDate] = useState(new Date());
    const dataHoje = new Date();

    // Modais
    const [showModalResumoDia, setShowModalResumoDia] = useState(false);
    const [showModalDefinirFolga, setShowModalDefinirFolga] = useState(false);

    const [loading, setLoading] = useState(false);

    const markedDays: MarkedDay[] = useMemo(() => {
        if (!dadosMes) return [];

        if (funcCalendar) {
            const diasMarcados = new Map<Date, string>();

            // Processa folgas
            if (Array.isArray(dadosMes.folgas)) {
                dadosMes.folgas.forEach(folga => {
                    folga.folgaDataPeriodo.forEach(data => {
                        const dataFolga = new Date(data);
                        if (dataFolga.getMonth() === currentDate.getMonth() && 
                            dataFolga.getFullYear() === currentDate.getFullYear()) {
                            diasMarcados.set(dataFolga, 'folga');
                        }
                    });
                });
            }

            // Processa faltas
            if (Array.isArray(dadosMes.faltas)) {
                dadosMes.faltas.forEach(falta => {
                    const dia = new Date(falta.faltaDia);
                    diasMarcados.set(dia, 'ausencia');
                });
            }

            // Processa férias
            if (Array.isArray(dadosMes.ferias)) {
                dadosMes.ferias.forEach(ferias => {
                    const dia = new Date(ferias.feriaData);
                    diasMarcados.set(dia, 'ferias');
                });
            }

            return Array.from(diasMarcados.entries()).map(([day, event]) => ({
                day,
                event
            }));
        } else {
            const diasMarcados = new Map<Date, { tipo: string; contagem: number }[]>();

            // Processa folgas
            if (Array.isArray(dadosMes.folgas)) {
                dadosMes.folgas.forEach(folga => {
                    folga.folgaDataPeriodo.forEach(data => {
                        const dataFolga = new Date(data);
                        if (dataFolga.getMonth() === currentDate.getMonth() && 
                            dataFolga.getFullYear() === currentDate.getFullYear()) {
                            const dia = dataFolga;
                            if (!diasMarcados.has(dia)) {
                                diasMarcados.set(dia, []);
                            }
                            const eventos = diasMarcados.get(dia)!;
                            const eventoFolga = eventos.find(e => e.tipo === 'folga');
                            if (eventoFolga) {
                                eventoFolga.contagem++;
                            } else {
                                eventos.push({ tipo: 'folga', contagem: 1 });
                            }
                        }
                    });
                });
            }

            // Processa faltas
            if (Array.isArray(dadosMes.faltas)) {
                dadosMes.faltas.forEach(falta => {
                    const dia = new Date(falta.faltaDia);
                    if (!diasMarcados.has(dia)) {
                        diasMarcados.set(dia, []);
                    }
                    const eventos = diasMarcados.get(dia)!;
                    const eventoFalta = eventos.find(e => e.tipo === 'ausencia');
                    if (eventoFalta) {
                        eventoFalta.contagem++;
                    } else {
                        eventos.push({ tipo: 'ausencia', contagem: 1 });
                    }
                });
            }

            // Processa férias
            if (Array.isArray(dadosMes.ferias)) {
                dadosMes.ferias.forEach(ferias => {
                    const dia = new Date(ferias.feriaData);
                    if (!diasMarcados.has(dia)) {
                        diasMarcados.set(dia, []);
                    }
                    const eventos = diasMarcados.get(dia)!;
                    const eventoFerias = eventos.find(e => e.tipo === 'ferias');
                    if (eventoFerias) {
                        eventoFerias.contagem++;
                    } else {
                        eventos.push({ tipo: 'ferias', contagem: 1 });
                    }
                });
            }

            return Array.from(diasMarcados.entries()).map(([day, events]) => ({
                day,
                events
            }));
        }
    }, [dadosMes, funcCalendar, currentDate]);
    
    useMemo(() => {
        const formatted_feriados = feriados.map((feriado) => {
            const [anoString, mesString, diaString] = (feriado.feriadoData as string).split('-');
            return new Date(Number(anoString), Number(mesString) - 1, Number(diaString));
        })
        setFormattedFeriados(formatted_feriados);
    }, [feriados])

    useEffect(() => {
        if(!funcCalendar){
            if(isBefore(startOfDay(selectedDate), startOfDay(dataHoje))){
                setShowModalResumoDia(true)
            }else if(!isSameDay(selectedDate, dataHoje)){
                setShowModalDefinirFolga(true)
            }
        }
    }, [selectedDate])

    const CustomDay = (props: DayProps) => {
        // Cria ref para o botão do dia
        const buttonRef = useRef<HTMLButtonElement>(null!);

        // Usa o hook useDayRender para pegar as props e dados padrões do day picker
        const dayRender = useDayRender(props.date, props.displayMonth, buttonRef);

        const dayNumber = props.date.getDate();
        const event = markedDays.find((e) => isSameDay(e.day, props.date)); // Agora comparando data completa 
        const isMultipleEvents = event && "events" in event;

        return (
        <div className="flex flex-col items-center gap-1 w-full h-full">
            {props.date > dataHoje && !funcCalendar
                ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button 
                                    {...dayRender.buttonProps} 
                                    ref={buttonRef} 
                                    className={cn(dayRender.buttonProps.className)}
                                >
                                        {dayNumber}
                                </button>
                            </TooltipTrigger>
                            <TooltipContent className="bg-[#FFB503] text-[#42130F]" side="bottom">
                                <span>Definir dia de folga</span>
                                <Arrow className="fill-[#FFB503]" />
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <button 
                        {...dayRender.buttonProps} 
                        ref={buttonRef} 
                        className={cn(
                            dayRender.buttonProps.className,
                            !isMultipleEvents && eventColorClasses[event?.event || ""]
                        )}
                    >
                            {dayNumber}
                    </button>
                )
            }
            

            
            {/* Se o dia tiver eventos, exibe o círculo com o número de eventos */}
            {(event && isMultipleEvents) && (
                <div className="w-full flex gap-1 justify-center flex-wrap">
                    {event.events?.map((e, idx) => {
                        const colorClass = eventColorClasses[e.tipo] ?? "bg-gray-500"; 
                        return (
                        <div key={idx} className={`flex justify-center md:pt-0.4 pt-0 items-center md:text-xs text-[0.5rem] rounded-full md:w-5 md:h-5 w-3 h-3 ${colorClass}`} >
                            {e.contagem}
                        </div>
                    )})}
                </div>
            )}
        </div>
        );
    };

    return(
        loading ? (
            <></>
        ) : (
            <>
                <div className="flex w-full flex-col items-center justify-center gap-6 bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] rounded-xl md:p-4 p-0">
                    <Calendar 
                        fromDate={undefined}
                        onMonthChange={(newMonthDate: Date) => {
                            setCurrentDate(newMonthDate);
                        }}
                        month={currentDate}
                        today={dataHoje}
                        onDayClick={(date: Date) => {setSelectedDate(date);}}
                        classNames={{
                            caption_label: "md:text-[1.5rem] text-[1rem] capitalize", 
                            head_cell: "text-black rounded-md w-full font-normal md:text-[1rem] text-[0.6rem] capitalize",
                            cell: "md:h-20 md:w-24 h-14 w-8 flex flex-col items-center justify-between md:text-[1rem] text-[0.6rem] p-0 relative",
                            day: cn(
                                buttonVariants({ variant: "ghost" }),
                                "md:h-9 md:w-9 h-5 w-5 p-0 font-normal md:text-[1rem] text-[0.5rem] aria-selected:opacity-100"
                            ),
                            day_today: "bg-[#FFB503] text-white",
                        }}
                        modifiers={{
                            today: [dataHoje],
                            selected: [selectedDate],
                        }}
                        components={{
                            Day: CustomDay, 
                        }}
                        holidays={formattedFeriados}
                    />
                </div>
                {showModalResumoDia &&
                    <ModalResumoDia
                        diaSelecionado={selectedDate}
                        onClose={() => setShowModalResumoDia(false)}
                        onClick={() => setShowModalResumoDia(false)}
                        dadosMes={dadosMes}
                        empCod={empCod}
                    />
                }
                {showModalDefinirFolga &&
                    <ModalDefinirFolgaGeral
                        diaSelecionado={selectedDate}
                        onClose={() => setShowModalDefinirFolga(false)}
                        onClick={() => setShowModalDefinirFolga(false)}
                        empCod={empCod}
                        usuarioCod={usuarioCod}
                    />
                }
            </>
        )
    )
}