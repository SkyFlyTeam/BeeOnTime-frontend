"use client";

import * as React from "react";
import { useEffect, useState } from "react"; // Importar useState
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/custom/histPonto/table";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/custom/tooltip";
import HistPontos, { Ponto } from "@/interfaces/hisPonto";
import RelatorioPonto from "@/interfaces/relatorioPonto";
import { Usuario } from "@/interfaces/usuario";


interface PointsHistoryTableProps {
  entries: RelatorioPonto[] | null ;
  onEdit: (entry: RelatorioPonto) => void;
  userInfo: Usuario | null;
  className?: string;
  accessLevel: "USER" | "ADM" //Recebe o AccessLevel para diferentes acessos
}

const PointsHistoryTable = React.forwardRef<
  HTMLDivElement,
  PointsHistoryTableProps
>(({ entries, onEdit, userInfo, className, accessLevel }, ref) => {


  // Definir os cabeçalhos, removendo "AÇÕES" para ADM
  const headers = [
    "DATA",
    "PONTOS",
    "HORAS NORMAIS",
    "HORAS EXTRAS",
    "HORAS FALTANTES",
    "ADICIONAL NOTURNO",
    ...(accessLevel === "USER" ? ["AÇÕES"] : []),
  ];

  // Função para calcular carga horária semanal e mensal
const calculateCargaHoraria = (horasDiarias: number, diasTrabalhados: number) => {
  const horasSemana = horasDiarias * diasTrabalhados; // Total de horas na semana
  const horasMes = horasSemana * 4; // Aproximadamente 4 semanas por mês
  return { horasSemana, horasMes };
};

// Organiza a jornada de trabalho com base nos dias que o usuário trabalha
const jornadaFormatada = () => {
  const diasDaSemanaSiglas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  
  // Filtra os dias da semana em que o usuário trabalha
  const diasTrabalhados = userInfo?.jornadas.jornada_diasSemana
    .map((trabalha, index) => trabalha ? diasDaSemanaSiglas[index] : null)
    .filter((dia) => dia !== null);
  
  if (diasTrabalhados && diasTrabalhados.length > 0) {
    return `${diasTrabalhados.join(", ")} das ${userInfo?.jornadas.jornada_horarioEntrada.toString().slice(0, 5)} até ${userInfo?.jornadas.jornada_horarioSaida.toString().slice(0, 5)}`;
  } else {
    return "Horário flexível"; // Caso o horário seja flexível
  }
};

const { horasSemana, horasMes } = calculateCargaHoraria(userInfo?.usuario_cargaHoraria!, userInfo?.jornadas?.jornada_diasSemana?.filter(dia => dia).length ?? 0)

  return (
    <div
      ref={ref}
      className={cn("p-6 shadow-xl rounded-xl", className)}
      style={{ boxShadow: "0px 0px 12px 4px rgba(0, 0, 0, 0.04)" }}
    >
      {accessLevel === "USER" ? (
        // Para USER: Exibir informações da jornada
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-3 md:py-2">
          <div className="flex flex-row items-start gap-2 md:gap-4">
            <h1 className="text-base md:text-lg font-bold">Jornada de Trabalho:</h1>
            <p className="text-base md:text-lg text-black">
              {jornadaFormatada()}
            </p>
          </div>
          <div className="flex flex-row items-start gap-2 md:gap-4">
            <h1 className="text-base md:text-lg font-bold">Carga horária:</h1>
            <p className="text-base md:text-lg text-black">
              {horasSemana}h/semana - {horasMes}h/mês
            </p>
          </div>
        </div>
      ) : (
        // Para ADM: Exibir apenas o título "Histórico de Pontos"
        <div className="mb-6">
          <h1 className="text-base md:text-lg font-bold">Histórico de Pontos</h1>
        </div>
      )}

      {/* Desktop - Tabela horizontal */}
      <div className="overflow-x-auto hidden md:block">
        <Table className="min-w-[900px] w-full">
          <TableHeader>
            <TableRow>
              {headers.map((header, idx) => (
                <TableHead
                  key={idx}
                  className="border border-gray-200 text-center font-bold text-black text-base p-4"
                >
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries && entries.map((entry, index) => (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
              >
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {new Date(entry.data).toLocaleDateString('pt-BR')}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  <div className="flex flex-col">
                  <div>{entry.pontos.map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`).join(" - ")}</div>
                  </div>
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.horasTrabalhadas}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.horasExtras}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.horasFaltantes}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.horasNoturnas}
                </TableCell>
                {accessLevel === "USER" && ( // Mostrar a coluna "AÇÕES" apenas para USER
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => onEdit(entry)}
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="text-[#42130F] bg-[#FFC107]">
                          <p>Solicitar ajuste</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile - Tabela deitada com mesmo estilo */}
      <div className="block md:hidden overflow-x-auto">
        <table className="min-w-[900px] w-full border-collapse text-sm text-black">
          <tbody>
            {[
              { label: "DATA", key: "date" },
              {
                label: "PONTOS",
                render: (e: RelatorioPonto) => (
                  <div className="flex flex-col text-center">
                    <div>{e.pontos.map((ponto: any) => `${ponto.tipoPonto} - ${ponto.horarioPonto}`).join(", ")}</div>
                  </div>
                ),
              },
              { label: "HORAS NORMAIS", key: "normalHours" },
              { label: "HORAS EXTRAS", key: "extraHours" },
              { label: "HORAS FALTANTES", key: "missingHours" },
              { label: "ADICIONAL NOTURNO", key: "nightShift" },
              ...(accessLevel === "USER" // Adicionar "AÇÕES" apenas para USER
                ? [
                  {
                    label: "AÇÕES",
                    render: (e: RelatorioPonto) => (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="bg-[#FFC107] hover:bg-[#e0a800] text-white"
                              onClick={() => onEdit(e)}
                            >
                              <PencilLine className="h-4 w-4 text-[#42130F]" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent className="text-[#42130F] bg-[#FFC107]">
                            <p>Solicitar ajuste</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    ),
                  },
                ]
                : []),
            ].map((row, idx) => (
              <tr key={idx}>
                <td className="border border-gray-200 p-3 font-semibold">{row.label}</td>
                {entries && entries.map((entry, i) => (
                  <td
                    key={i}
                    className={`border border-gray-200 p-3 text-center text-base ${i % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      }`}
                  >
                    {typeof row.render === "function"
                      ? row.render(entry)
                      : (entry as any)[row.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };