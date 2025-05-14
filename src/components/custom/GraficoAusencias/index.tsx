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
    folgas: number
    licencasMedicas: number
    ferias: number
    ausenciasJustificadas: number
    ausenciasNaoJustificadas: number
}

export default function GraficoAusencias({ folgas, licencasMedicas, ferias, ausenciasJustificadas, ausenciasNaoJustificadas }: GraficoAtraso) {
    const values = [folgas, licencasMedicas, ferias, ausenciasJustificadas, ausenciasNaoJustificadas];
    
    const filteredValues = values.filter(value => value !== 0);

    const filteredLabels = [
        `Folga\n${(folgas / values.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`,
        `Licença médica\n${(licencasMedicas / values.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`,
        `Férias\n${(ferias / values.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`,
        `Ausências com\njustificativa\n${(ausenciasJustificadas / values.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`,
        `Ausências sem\njustificativa\n${(ausenciasNaoJustificadas / values.reduce((a, b) => a + b, 0) * 100).toFixed(1)}%`
    ];

    const total = filteredValues.reduce((a, b) => a + b, 0);

    const dataAusencias = {
        labels: filteredLabels.filter((_, index) => values[index] !== 0),
        datasets: [
            {
                data: filteredValues,
                backgroundColor: ['#FFB503', '#42130F', '#744A26', '#F79522', '#FFCB50']
            }
        ]
    };

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
                textAlign: 'center',
                formatter: (value: any, ctx: any) => {
                    const data = ctx.chart.data.datasets![0].data as number[];
                    const total = data.reduce((a, b) => a + b, 0);
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
            }
        },
        cutoutPercentage: 80,
        aspectRatio: 1.5,
    };

    return(
        <div className="flex flex-col lg:flex-row justify-around items-center">
            <div className="w-full lg:w-1/2 text-center">
                <Pie data={dataAusencias} options={options} />
            </div>
        </div>
    );
}
