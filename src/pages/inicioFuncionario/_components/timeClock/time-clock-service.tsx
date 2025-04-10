import { useState } from "react";

import MarcacaoPonto, { Ponto } from "@/interfaces/marcacaoPonto";

export default function TimeClockService() {

    const [almocoCount, setAlmocoCount] = useState<number>(() => {
        const stored = localStorage.getItem("almocoCount");
        return stored ? parseInt(stored) : 0;
    });

    const verificarPontos = (mpontos: MarcacaoPonto) => {

        const registros_pontos = mpontos.pontos as Ponto[]

        if(!registros_pontos){
            return 
        }

        // estado
        let estado: "initial" | "entrada" | "inicioIntervalo" | "fimIntervalo" | "saida" = "initial"

        const ultimo_ponto: Ponto = registros_pontos.at(-1) as Ponto

        if (ultimo_ponto.tipoPonto == 0) {
            estado = "entrada"
        }
        else if ((ultimo_ponto.tipoPonto == 2) && almocoCount == 0){
            estado = "inicioIntervalo"
            let almoco_add = almocoCount + 1
            localStorage.setItem("almocoCount", almoco_add.toString());
        }
        else if ((ultimo_ponto.tipoPonto == 2) && almocoCount == 1){
            estado = "fimIntervalo"
            let almoco_add = almocoCount + 1
            localStorage.setItem("almocoCount", almoco_add.toString());
        }
        else if (ultimo_ponto.tipoPonto == 1) {
            estado = "saida"
            localStorage.setItem("almocoCount", '0');
        }
        else {
            estado = 'initial'
        }

        return estado
    }

    return { 
        verificarPontos
    }
}