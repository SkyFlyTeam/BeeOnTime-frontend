// Interfaces
import HistPonto from "@/interfaces/histPonto";

// Components
import { LogIn, LogOut } from "lucide-react";
import { useEffect, useState } from "react";


import styles from './styles.module.css';


interface CardHistPontoProps {
    lastPointsFirst: HistPonto | null;
    lastPointsSecond: HistPonto | null;
    className?: string;
}
const CardHistPonto = ({ lastPointsFirst, lastPointsSecond, className }: CardHistPontoProps) => {

    const [firstPoints, setFirstPoints] = useState<string[]>([
        "--:--", "--:--", "--:--", "--:--",
    ]);
    const [firstPointsDate, setFirstPointsData] = useState<string>("--/--/----");
    const [secondPoints, setSecondPoints] = useState<string[]>([
        "--:--", "--:--", "--:--", "--:--",
    ]);
    const [secondPointsDate, setSecondPointsData] = useState<string>("--/--/----");


    useEffect(() => {
        if (!lastPointsFirst)
            return;

        if (!lastPointsFirst.pontos)
            return;

        let newFirstPoints = Object.assign([] as string[], firstPoints);

        let entrada: string[] = [];
        let saida: string[] = [];
        let almoco: string[] = [];
        lastPointsFirst.pontos.forEach((ponto) => {
            if (!ponto)
                return;
            if (!ponto.tipoPonto)
                return;
            if (!ponto.horarioPonto)
                return;

            switch (ponto.tipoPonto.toString()) {
                case "0":
                    entrada.push(ponto.horarioPonto.toString().substring(0, 5));
                    break;
                case "1":
                    saida.push(ponto.horarioPonto.toString().substring(0, 5));
                    break;
                case "2":
                    almoco.push(ponto.horarioPonto.toString().substring(0, 5))
                    break;
                default:
            }
        })

        if (entrada[0])
            newFirstPoints[0] = entrada[0];

        if (saida[0])
            newFirstPoints[3] = saida[0];

        if (!almoco[0])
            return;
        if (!almoco[1])
            newFirstPoints[1] = almoco[0]
        if (almoco[1])
            if (almoco[1] > almoco[0]) {
                newFirstPoints[1] = almoco[0]
                newFirstPoints[2] = almoco[1]
            }
            else {
                newFirstPoints[1] = almoco[1]
                newFirstPoints[2] = almoco[0]
            }

        setFirstPoints(newFirstPoints)

        if (!lastPointsFirst.horasData)
            return;
        setFirstPointsData(lastPointsFirst.horasData.toString())
    }, [lastPointsFirst])

    useEffect(() => {
        if (!lastPointsSecond)
            return;

        if (!lastPointsSecond.pontos)
            return;

        let newSecondPoints = Object.assign([] as string[], secondPoints);

        let entrada: string[] = [];
        let saida: string[] = [];
        let almoco: string[] = [];
        lastPointsSecond.pontos.forEach((ponto) => {
            if (!ponto)
                return;
            if (!ponto.tipoPonto)
                return;
            if (!ponto.horarioPonto)
                return;

            switch (ponto.tipoPonto.toString()) {
                case "0":
                    entrada.push(ponto.horarioPonto.toString().substring(0, 5));
                    break;
                case "1":
                    saida.push(ponto.horarioPonto.toString().substring(0, 5));
                    break;
                case "2":
                    almoco.push(ponto.horarioPonto.toString().substring(0, 5))
                    break;
                default:
            }
        })

        if (entrada[0])
            newSecondPoints[0] = entrada[0];

        if (saida[0])
            newSecondPoints[3] = saida[0];

        if (!almoco[0])
            return;
        if (!almoco[1])
            newSecondPoints[1] = almoco[0]
        if (almoco[1])
            if (almoco[1] > almoco[0]) {
                newSecondPoints[1] = almoco[0]
                newSecondPoints[2] = almoco[1]
            }
            else {
                newSecondPoints[1] = almoco[1]
                newSecondPoints[2] = almoco[0]
            }

        setSecondPoints(newSecondPoints)

        if (!lastPointsSecond.horasData)
            return;
        setSecondPointsData(lastPointsSecond.horasData.toString())
    }, [lastPointsSecond])

    return (
        <div className={"flex flex-col justify-between bg-white shadow-md p-6 rounded-xl " + (className ? className : "")}>
            <div>
                <p className="w-full text-center font-bold text-xl">Histórico de Pontos</p>
            </div>
            <div className="flex flex-col gap-4">
                <p className="w-full text-start font-bold mt-4 text-lg text-[#FFB503]">
                    {firstPointsDate}
                </p>
                <div className="flex flex-col gap-2">
                    <div className="flex flex-row gap-2">
                        <LogIn className="text-gray-400"></LogIn>
                        <span className="text-gray-400 font-mono">
                            {firstPoints[0]}
                        </span>
                        <span>Entrada</span>
                    </div>
                    <div className="flex flex-row gap-2">
                        <LogOut className="text-gray-400"></LogOut>
                        <span className="text-gray-400 font-mono">
                            {firstPoints[1]}
                        </span>
                        <span>Início intervalo</span>
                    </div><div className="flex flex-row gap-2">
                        <LogIn className="text-gray-400"></LogIn>
                        <span className="text-gray-400 font-mono">
                            {firstPoints[2]}
                        </span>
                        <span>Fim intervalo</span>
                    </div><div className="flex flex-row gap-2">
                        <LogOut className="text-gray-400"></LogOut>
                        <span className="text-gray-400 font-mono">
                            {firstPoints[3]}
                        </span>
                        <span>Saída</span>
                    </div>
                </div>
                <div className="flex flex-col gap-2">
                    <p className="w-full text-start font-bold text-lg text-[#FFB503]">
                        {secondPointsDate}
                    </p>
                    <div className="flex flex-col gap-2">
                        <div className="flex flex-row gap-2">
                            <LogIn className="text-gray-400"></LogIn>
                            <span className="text-gray-400 font-mono">
                                {secondPoints[0]}
                            </span>
                            <span>Entrada</span>
                        </div>
                        <div className="flex flex-row gap-2">
                            <LogOut className="text-gray-400"></LogOut>
                            <span className="text-gray-400 font-mono">
                                {secondPoints[1]}
                            </span>
                            <span>Início intervalo</span>
                        </div><div className="flex flex-row gap-2">
                            <LogIn className="text-gray-400"></LogIn>
                            <span className="text-gray-400 font-mono">
                                {secondPoints[2]}
                            </span>
                            <span>Fim intervalo</span>
                        </div><div className="flex flex-row gap-2">
                            <LogOut className="text-gray-400"></LogOut>
                            <span className="text-gray-400 font-mono">
                                {secondPoints[3]}
                            </span>
                            <span>Saída</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    )

}

export default CardHistPonto;