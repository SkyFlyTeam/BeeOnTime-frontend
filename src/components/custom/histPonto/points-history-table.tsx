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
import PontoService from "@/services/PontoService";

interface PointEntry {
  date: string;
  pointsMorning: string;
  pointsAfternoon: string;
  normalHours: string;
  extraHours: string;
  missingHours: string;
  nightShift: string;
}

interface PointsHistoryTableProps {
  entries: PointEntry[];
  onEdit: (entry: PointEntry) => void;
  className?: string;
  accessLevel: "USER" | "ADM" //Recebe o AccessLevel para diferentes acessos
}

const PointsHistoryTable = React.forwardRef<
  HTMLDivElement,
  PointsHistoryTableProps
>(({ entries, onEdit, className, accessLevel }, ref) => {


  /* Ativar quando for usar o backend */
  // Estado para os dados da tabela
  // const [loading, setLoading] = useState<boolean>(true);
  // const [error, setError] = useState<string | null>(null);

  // Carregar os dados do backend
  // useEffect(() => {
  //   const fetchPoints = async () => {
  //     try {
  //       setLoading(true);
  //       const response = await PontoService.getPoints("user123", "05", "2025");
  //       // setEntries(response.data); // Comentado para usar mockEntries
  //     } catch (err) {
  //       setError("Erro ao carregar os pontos. Tente novamente mais tarde.");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchPoints();
  // }, []);

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
              Segunda-feira a sexta-feira, das 8h15 até 17h50
            </p>
          </div>
          <div className="flex flex-row items-start gap-2 md:gap-4">
            <h1 className="text-base md:text-lg font-bold">Carga horária:</h1>
            <p className="text-base md:text-lg text-black">
              20h/semana - 450h/mês
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
            {entries.map((entry, index) => (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
              >
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.date}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  <div className="flex flex-col">
                    <div>{entry.pointsMorning}</div>
                    <div>{entry.pointsAfternoon}</div>
                  </div>
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.normalHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.extraHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.missingHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                  {entry.nightShift}
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
                render: (e: PointEntry) => (
                  <div className="flex flex-col text-center">
                    <div>{e.pointsMorning}</div>
                    <div>{e.pointsAfternoon}</div>
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
                    render: (e: PointEntry) => (
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
                {entries.map((entry, i) => (
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