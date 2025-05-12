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

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale);

const mockAtraso = 2100;
const mockPontuais = 5950;
const mockSolicitacoesAjustes = 950;
const mockCorretas = 5938;

// Dados para os gráficos
const dataAtrasos = {
    labels: ['Atrasos', 'Pontuais'],
    datasets: [
        {
            data: [mockAtraso, mockPontuais],
            backgroundColor: ['#FFB84D', '#FF8C1A'],
        },
    ],
};

const dataSolicitacoes = {
    labels: ['Solicitações de ajuste', 'Marcações corretas'],
    datasets: [
        {
            data: [mockSolicitacoesAjustes, mockCorretas],
            backgroundColor: ['#FFB84D', '#FF8C1A'],
        },
    ],
};

export default function GraficoFalhas() {
    const options = {
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                enabled: true, 
            },
        },
    };

    const percAtrasos = (mockAtraso / (mockAtraso + mockPontuais)) * 100
    const percPontuais = (mockPontuais / (mockAtraso + mockPontuais)) * 100
    const percSolicitacoes = (mockSolicitacoesAjustes / (mockCorretas + mockSolicitacoesAjustes)) * 100
    const percCorretas = (mockCorretas / (mockCorretas + mockSolicitacoesAjustes)) * 100

    return (
        <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
            <div style={{ width: '20%', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Resumo de Marcação</h3>
                <p>{mockAtraso} Atrasos {percAtrasos.toFixed(1)}%</p>
                <Pie data={dataAtrasos} options={options} />
                <div style={{ marginTop: '10px' }}>
                    <p>{mockPontuais} Pontuais {percPontuais.toFixed(1)}%</p>
                </div>
            </div>
            <div style={{ width: '20%', textAlign: 'center' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Solicitações de ajuste de ponto</h3>
                <p>{mockSolicitacoesAjustes} Solicitações de ajuste {percSolicitacoes.toFixed(1)}%</p>
                <Pie data={dataSolicitacoes} options={options} />
                <div style={{ marginTop: '10px' }}>
                    <p>{mockCorretas} Marcações corretas {percCorretas.toFixed(1)}%</p>
                </div>
            </div>
        </div>
    );
}
