import React, { useRef, useEffect, useState } from 'react';
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
    onSliceClick?: (label: string) => void;
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
    const [isMobile, setIsMobile] = useState(false);
    const [isMobileMore, setIsMobileMore] = useState(false)

    useEffect(() => {
        function handleResize() {
            const width = window.innerWidth;
            if (width < 321) {
                setIsMobileMore(true);
                setIsMobile(false);
            } else if (width < 768) {
                setIsMobileMore(false);
                setIsMobile(true);
            } else {
                setIsMobileMore(false);
                setIsMobile(false);
            }
        }
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);


    const values = [folgas, licencasMedicas, ferias, ausenciasJustificadas, ausenciasNaoJustificadas];
    const total = values.reduce((a, b) => a + b, 0);

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

    const displayLabels = labelsToDisplay.map((label, i) =>
        `${label}\n${((values[i] / total) * 100).toFixed(1)}%`
    );

    const colorMap: Record<string, string> = {
        'Folga': '#FFB503',
        'Licença médica': '#42130F',
        'Férias': '#744A26',
        'Ausências com justificativa': '#F79522',
        'Ausências sem justificativa': '#FFCB50',
    };

    const filteredData = pureLabels
        .map((label, i) => ({ label, displayLabel: displayLabels[i], value: values[i] }))
        .filter((item) => item.value > 0);

    const dataAusencias = {
        labels: filteredData.map(item => item.displayLabel),
        datasets: [{
            data: filteredData.map(item => item.value),
            backgroundColor: filteredData.map(item => colorMap[item.label]),
        }],
    };

    const options = {
        maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { enabled: false },
            datalabels: {
                color: '#000',
                font: {
                    weight: 'bold',
                    size: isMobileMore ? 10 : isMobile ? 10 : 14
                },
                anchor: 'end',
                align: 'end',
                textAlign: 'center',
                offset: isMobileMore || isMobile ? -8 : 10, 
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
                top: isMobile ? 30 : 80,
                bottom: isMobile ? 30 : 80,
                left: isMobileMore || isMobile ? 70 : 55,
                right: isMobileMore || isMobile ? 70 : 55,
            },
        },
        cutoutPercentage: 80,
        // aspectRatio: 1.5, // opcional, remova se quiser que gráfico se adapte livremente
    };

    const handleClick = (event: any) => {
        if (!chartRef.current) return;

        const chart = chartRef.current;
        const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, false);

        if (elements.length > 0) {
            const idx = elements[0].index;
            const label = filteredData[idx].label;
            if (onSliceClick) onSliceClick(label);
        }
    };

    return (
        <div style={{ height: '100%', minHeight: 300 }}>
            <Pie ref={chartRef} data={dataAusencias} options={options} onClick={handleClick} />
        </div>
    );
}
