import FeriadoItem from "./feriadoItem";

const feriados = [
  { nome: "Sexta-Feira Santa", data: "2025-04-18" },
  { nome: "Tiradentes", data: "2025-04-21" },
  { nome: "Dia Do Trabalhador", data: "2025-05-01" },
];

function calcularDiasRestantes(data: string): number {
  const hoje = new Date();
  const feriado = new Date(data);
  const diff = feriado.getTime() - hoje.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function formatarData(data: string) {
  const date = new Date(data);
  const dia = String(date.getDate()).padStart(2, "0");
  const mes = date.toLocaleString("pt-BR", { month: "short" }).toUpperCase().replace('.', '');
  return { dia, mes };
}

export default function CardFeriado() {
  return (
    <div className="flex flex-col justify-between bg-white shadow-md p-6 rounded-xl w-[768px] min-w-fit max-[565px]:w-[90%]">
      <div className="relative flex items-center">
        <p className="w-full text-center font-bold text-xl">Feriados</p>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-6 mt-6">
        {feriados.map((feriado) => {
          const { dia, mes } = formatarData(feriado.data);
          const diasRestantes = calcularDiasRestantes(feriado.data);
          return (
            <FeriadoItem
              key={feriado.nome}
              dia={dia}
              mes={mes}
              nome={feriado.nome}
              diasRestantes={diasRestantes}
            />
          );
        })}
      </div>
    </div>
  );
}