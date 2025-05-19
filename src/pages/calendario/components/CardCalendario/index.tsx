import { useEffect, useRef, useState } from "react";

import { Calendar } from "@/components/ui/calendar";

import "react-datepicker/dist/react-datepicker.css";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { DayProps, useDayRender } from "react-day-picker";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Arrow } from "@radix-ui/react-tooltip";
import ModalResumoDia from "@/components/custom/ModaisCalendario/ModalResumoDia";

import { isBefore, isSameDay, startOfDay } from 'date-fns';
import ModalDefinirFolgaCalendario from "@/components/custom/ModaisCalendario/ModalDefinirFolga";


interface CardCalendarioProps {
    funcCalendar: boolean;
    empCod: number;
}

const eventColorClasses: Record<string, string> = {
  ferias: "bg-[#95e1d8] text-[#5e9091]",
  ausencia: "bg-[#FFAAAA] text-[#AA4846]",
  folga: "bg-[#d1a0f5] text-[#7c559a]",
};

type MarkedDay =
  | { day: number; events: { tipo: string; contagem: number }[] } // usado quando `!funcCalendar`
  | { day: number; event: string }; // usado quando `funcCalendar`

export const CardCalendario = ({ funcCalendar, empCod }: CardCalendarioProps) => {
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Modais
    const [showModalResumoDia, setShowModalResumoDia] = useState(false);
    const [showModalDefinirFolga, setShowModalDefinirFolga] = useState(false);

    const [loading, setLoading] = useState(false);
    const currentData = new Date();

    const markedDays: MarkedDay[] = funcCalendar
    ? [
        { day: 10, event: 'folga' },
        { day: 15, event: 'ausencia' },
        { day: 20, event: 'ferias' }
        ]
    : [
        { day: 10, events: [{ tipo: 'folga', contagem: 5 }, { tipo: 'ferias', contagem: 2 }] },
        { day: 15, events: [{ tipo: 'folga', contagem: 5 }] },
        { day: 20, events: [{ tipo: 'folga', contagem: 1 }, { tipo: 'ferias', contagem: 3 }, { tipo: 'ausencia', contagem: 12 }] }
        ];

    const holidays = [
       new Date('2025-05-26')
    ];

    useEffect(() => {
        if(!funcCalendar){
            if(isBefore(startOfDay(selectedDate), startOfDay(currentData))){
                setShowModalResumoDia(true)
            }else if(!isSameDay(selectedDate, currentData)){
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
        const event = markedDays.find((e) => e.day === dayNumber);
        const isMultipleEvents = event && "events" in event;

        return (
        <div className="flex flex-col items-center gap-1 w-full h-full">
            {props.date > currentData && !funcCalendar
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
                    {event.events?.map((e) => {
                        const colorClass = eventColorClasses[e.tipo] ?? "bg-gray-500"; 
                        return (
                        <div className={`flex justify-center md:pt-0.5 pt-0 items-center md:text-xs text-[0.5rem] rounded-full md:w-5 md:h-5 w-3 h-3 ${colorClass}`} >
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
                        today={currentData}
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
                            today: [currentData],
                            selected: [selectedDate],
                        }}
                        components={{
                            Day: CustomDay, 
                        }}
                        holidays={holidays}
                    />
                </div>
                {showModalResumoDia &&
                    <ModalResumoDia
                        diaSelecionado={selectedDate}
                        onClose={() => setShowModalResumoDia(false)}
                        onClick={() => setShowModalResumoDia(false)}
                    />
                }
                {showModalDefinirFolga &&
                    <ModalDefinirFolgaCalendario
                        diaSelecionado={selectedDate}
                        onClose={() => setShowModalDefinirFolga(false)}
                        onClick={() => setShowModalDefinirFolga(false)}
                        empCod={empCod}
                    />
                }
            </>
        )
    )
}