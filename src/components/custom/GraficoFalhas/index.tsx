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

ChartJS.register(Title, Tooltip, Legend, ArcElement, CategoryScale, LinearScale, ChartDataLabels);

interface GraficoAtraso {
  atrasos: number;
  pontuais: number;
  solicitacoesAjustes: number;
  marcacoesCorretas: number;
}

export default function GraficoFalhas({
  atrasos,
  pontuais,
  solicitacoesAjustes,
  marcacoesCorretas,
}: GraficoAtraso) {
  const totalAtrasosPontuais = atrasos + pontuais;
  const totalSolicitacoesCorretas = marcacoesCorretas + solicitacoesAjustes;

  const percAtrasos =
    totalAtrasosPontuais > 0 ? (atrasos / totalAtrasosPontuais) * 100 : 0;
  const percPontuais =
    totalAtrasosPontuais > 0 ? (pontuais / totalAtrasosPontuais) * 100 : 0;
  const percSolicitacoes =
    totalSolicitacoesCorretas > 0
      ? (solicitacoesAjustes / totalSolicitacoesCorretas) * 100
      : 0;
  const percCorretas =
    totalSolicitacoesCorretas > 0
      ? (marcacoesCorretas / totalSolicitacoesCorretas) * 100
      : 0;

  const primary = '#FF8C1A';
  const secondary = '#FFB84D';

  const dataAtrasos = {
    labels: [
      `Atrasos\n${percAtrasos.toFixed(1)}%`,
      `Pontuais\n${percPontuais.toFixed(1)}%`,
    ],
    datasets: [
      {
        data: [atrasos, pontuais],
        backgroundColor: [secondary, primary],
      },
    ],
  };

  const dataSolicitacoes = {
    labels: [
      `Solicitações\nde ajuste\n${percSolicitacoes.toFixed(1)}%`,
      `Marcações\ncorretas\n${percCorretas.toFixed(1)}%`,
    ],
    datasets: [
      {
        data: [solicitacoesAjustes, marcacoesCorretas],
        backgroundColor: [secondary, primary],
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,   // libera o gráfico para preencher todo o container
    plugins: {
      legend: { display: false },
      tooltip: { enabled: false },
      datalabels: {
        color: '#000',
        font: { weight: 'bold', size: 14 },
        anchor: 'end',
        align: 'end',
        textAlign: 'center',
        formatter: (value: number, ctx: any) => {
          const data = ctx.chart.data.datasets[0].data as number[];
          const label = ctx.chart.data.labels![ctx.dataIndex] as string;
          return `${value}\n${label}`;
        },
      },
    },
    layout: {
      padding: { top: 80, bottom: 80, left: 55, right: 55 },
    },
    cutoutPercentage: 80,
  };

  return (
    <div className="flex flex-col lg:flex-row justify-around items-center">
      {/* Gráfico de atrasos x pontuais */}
      {totalAtrasosPontuais > 0 && (
        <div className="w-full lg:w-1/2 text-center mb-6 lg:mb-0">
          <h3 className="text-lg font-bold mb-2">Resumo de Marcação</h3>
          {/* aqui: h-80 (mobile ≈320px) e lg:h-96 (desktop ≈384px) */}
          <div className="h-80 lg:h-96">
            <Pie data={dataAtrasos} options={options} />
          </div>
        </div>
      )}

      {/* Gráfico de solicitações x corretas */}
      {totalSolicitacoesCorretas > 0 && (
        <div className="w-full lg:w-1/2 text-center">
          <h3 className="text-lg font-bold mb-2">
            Solicitações de ajuste de ponto
          </h3>
          <div className="h-80 lg:h-96">
            <Pie data={dataSolicitacoes} options={options} />
          </div>
        </div>
      )}
    </div>
  );
}
