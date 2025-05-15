import React, { useRef } from 'react';
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

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, ChartDataLabels);

interface GraficoAtraso {
    folgas: number;
    licencasMedicas: number;
    ferias: number;
    ausenciasJustificadas: number;
    ausenciasNaoJustificadas: number;
    onSliceClick?: (label: string) => void;  // callback de clique
}

export default function GraficoAusencias({
    folgas,
    licencasMedicas,
    ferias,
    ausenciasJustificadas,
    ausenciasNaoJustificadas,
    onSliceClick,
}: GraficoAtraso) {
    const chartRef = useRef<any>(null);

    const values = [folgas, licencasMedicas, ferias, ausenciasJustificadas, ausenciasNaoJustificadas];
    const total = values.reduce((a, b) => a + b, 0);

    // Labels puros, para uso no clique e lógica
    const pureLabels = [
        'Folga',
        'Licença médica',
        'Férias',
        'Ausências com justificativa',
        'Ausências sem justificativa',
    ];

    const labelsToDisplay = [
        'Folga',
        'Licença médica',
        'Férias',
        'Ausências\ncom justificativa',
        'Ausências\nsem justificativa',
    ];

    // Labels com quebra de linha para exibição no gráfico
    const displayLabels = labelsToDisplay.map((label, i) =>
        `${label}\n${((values[i] / total) * 100).toFixed(1)}%`
    );

    // Filtra só as fatias com valor > 0
    const filteredData = pureLabels
        .map((label, i) => ({ label, displayLabel: displayLabels[i], value: values[i] }))
        .filter((item) => item.value > 0);

    const dataAusencias = {
        labels: filteredData.map(item => item.displayLabel),
        datasets: [
            {
                data: filteredData.map(item => item.value),
                backgroundColor: ['#FFB503', '#42130F', '#744A26', '#F79522', '#FFCB50'],
            },
        ],
    };

    const options = {
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
                color: '#000',
                font: { weight: 'bold', size: 14 },
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
            padding: { top: 80, bottom: 80, left: 55, right: 55 },
        },
        cutoutPercentage: 80,
        aspectRatio: 1.5,
    };

    // Handler do clique
    const handleClick = (event: any) => {
        if (!chartRef.current) return;

        const chart = chartRef.current;

        const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);

        if (elements.length > 0) {
            const idx = elements[0].index;
            const label = filteredData[idx].label; // pega o label puro, sem \n
            if (onSliceClick) onSliceClick(label);
        }
    };

    return (
        <Pie ref={chartRef} data={dataAusencias} options={options} onClick={handleClick} />
    );
}
