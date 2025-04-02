import { Api } from "@/config/apiHorasConfig"
import HistPontos, { Ponto } from "@/interfaces/hisPonto";
import Horas from "@/interfaces/horas";
import { pontoServices } from "@/services/pontoServices";
import { useEffect, useState } from "react";

interface horasDTO{
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas: number,
    horasFaltantes: number,
    horasData: string,
    usuarioCod: number
}

interface horasDTOP{
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas: number,
    horasFaltantes: number,
    horasData: string,
    usuarioCod: number,
    horasCod: number
}

function timeStringToHours(time: string): number {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = time.split(":").map(Number);

    // Convert the time into an hour unit (integer) including fractions of hours
    const totalHours = hours + (minutes / 60) + (seconds / 3600);
    return totalHours;
}


export default function TimeClockService() {

    const [almocoCount, setAlmocoCount] = useState(0);
    
    const fetchPontosByHorasCod = async(horasCod: number) => {
        try {
            const m_pontos = await pontoServices.getPontosByHorasCod(horasCod);
            return m_pontos as HistPontos
        }  catch (error){
            console.log(error)
            throw error
        }
    }

    useEffect(() => {
        console.log('almoco count', almocoCount)
    })

    const verificarPontos = (mpontos: HistPontos) => {

        const registros_pontos = mpontos.pontos as Ponto[]

        if(!registros_pontos){
            return 
        }

        // estado
        let estado: "initial" | "entrada" | "inicioIntervalo" | "fimIntervalo" | "saida" = "initial"
        
        registros_pontos.map(item => {
            if (item.tipoPonto == 0) {
                estado = "entrada"
            }
            else if ((item.tipoPonto == 2) && almocoCount == 0){
                estado = "inicioIntervalo"
                setAlmocoCount(prev => prev + 1);
            }
            else if ((item.tipoPonto == 2) && almocoCount == 1){
                estado = "fimIntervalo"
                setAlmocoCount(prev => prev + 1);
            }
            else if (item.tipoPonto == 1) {
                estado = "saida"
            }
            else {
                estado = 'initial'
            }

        })

        return estado
    }

    return { 
        verificarPontos
    }

}