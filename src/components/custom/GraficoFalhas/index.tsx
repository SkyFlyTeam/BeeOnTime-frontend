import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    Title,
    Tooltip,
    Legend,
    ArcElement,
    CategoryScale,
    LinearScale,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, ChartDataLabels)

interface GraficoAtraso {
    atrasos: number
    pontuais: number
    solicitacoesAjustes: number
    marcacoesCorretas: number
}

export default function GraficoFalhas({atrasos, pontuais, solicitacoesAjustes, marcacoesCorretas}: GraficoAtraso) {
    const percAtrasos = (atrasos / (atrasos + pontuais)) * 100
    const percPontuais = (pontuais / (atrasos + pontuais)) * 100
    const percSolicitacoes = (solicitacoesAjustes / (marcacoesCorretas + solicitacoesAjustes)) * 100
    const percCorretas = (marcacoesCorretas / (marcacoesCorretas + solicitacoesAjustes)) * 100

    const primary = '#FF8C1A'
    const secondary = '#FFB84D'

    const dataAtrasos = {
        labels: [`Atrasos\n${percAtrasos.toFixed(1)}%`, `Pontuais\n${percPontuais.toFixed(1)}%`],
        datasets: [
            {
                data: [atrasos, pontuais],
                backgroundColor: [secondary, primary],
            },
        ],
    };

    const dataSolicitacoes = {
        labels: [`Solicitações\nde ajuste\n${percSolicitacoes.toFixed(1)}%`, `Marcações\ncorretas\n${percCorretas.toFixed(1)}%`],
        datasets: [
            {
                data: [solicitacoesAjustes, marcacoesCorretas],
                backgroundColor: [secondary, primary],
            },
        ],
    }

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
            color: '#000',             
            font: {                     
                weight: 'bold',
                size: 14,
            },
            anchor: 'end',             
            align: 'end',      
            formatter: (value: any, ctx: any) => {
                const data = ctx.chart.data.datasets![0].data as number[];
                const total = data.reduce((a, b) => a + b, 0);
                const pct  = (value as number) / total * 100;
                const label = ctx.chart.data.labels[ctx.dataIndex];
                return `${value}\n${label}`;
            },
            },
        },
        layout: {
            padding: {
            top: 80,   
            bottom: 80, 
            left: 55,   
            right: 55,  
            },
        },
        cutoutPercentage: 80,
        aspectRatio: 1.5
    };

    return (
        <div className="flex flex-col lg:flex-row justify-around items-center">
            <div className="w-full lg:w-1/2 text-center mb-6 lg:mb-0">
                <h3 className="text-lg font-bold">Resumo de Marcação</h3>
                <Pie data={dataAtrasos} options={options} />
            </div>
            <div className="w-full lg:w-1/2 text-center">
                <h3 className="text-lg font-bold">Solicitações de ajuste de ponto</h3>
                <Pie data={dataSolicitacoes} options={options} />
            </div>
        </div>
    );
}
