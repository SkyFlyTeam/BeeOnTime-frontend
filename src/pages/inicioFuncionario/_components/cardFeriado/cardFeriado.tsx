import { Feriado } from "@/interfaces/feriado";
import FeriadoItem from "./feriadoItem";
import { useEffect, useState } from "react";
import { feriadoServices } from "@/services/feriadoService";
import dayjs from "dayjs";
import "dayjs/locale/pt-br";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";

dayjs.extend(isSameOrAfter);

dayjs.locale("pt-br");


function calcularDiasRestantes(data: string | Date): number {
  const hoje = dayjs().startOf("day");
  const feriado = dayjs(data).startOf("day");
  return feriado.diff(hoje, "day");
}

function formatarData(data: string) {
  const date = dayjs(data);
  const dia = date.format("DD");
  const mes = date.format("MMM").toUpperCase();
  return { dia, mes };
}

export default function CardFeriado() {
  const [feriados, setFeriados] = useState<Feriado[]>([])

  useEffect(() => {
  const fetchFeriados = async () => {
    const response = await feriadoServices.getAllFeriado();
    if (Array.isArray(response)) {
      const hoje = dayjs().startOf("day");
      const proximosFeriados = response
        .filter((feriado) => dayjs(feriado.feriadoData).isSameOrAfter(hoje))
        .sort((a, b) =>
          dayjs(a.feriadoData).diff(dayjs(b.feriadoData))
        )
        .slice(0, 6);
      setFeriados(proximosFeriados);
    } else {
      console.error("Erro ao buscar feriados:", response.message);
    }
  };

  fetchFeriados();
}, []);
  return (
    <div className="flex flex-col justify-between bg-white shadow-md p-6 rounded-xl w-[768px] min-w-fit max-[565px]:w-[90%]">
      <div className="relative flex items-center">
        <p className="w-full text-center font-bold text-xl">Feriados</p>
      </div>

      <div className="grid grid-cols-2 gap-y-6 gap-x-6 mt-6">
        {feriados.map((feriado) => {
          const { dia, mes } = formatarData(String(feriado.feriadoData));
          const diasRestantes = calcularDiasRestantes(String(feriado.feriadoData));
          return (
            <FeriadoItem
              key={feriado.feriadoNome}
              dia={dia}
              mes={mes}
              nome={feriado.feriadoNome}
              diasRestantes={diasRestantes}
            />
          );
        })}
      </div>
    </div>
  );
}