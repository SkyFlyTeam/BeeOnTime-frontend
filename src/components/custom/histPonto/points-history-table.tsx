"use client";

import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/custom/histPonto/table";
import { Button } from "@/components/ui/button";
import { ChevronDown, PencilLine } from "lucide-react";
import { cn } from "@/lib/utils";

// Tipagem dos dados de cada linha
interface PointEntry {
  date: string;
  pointsMorning: string;
  pointsAfternoon: string;
  normalHours: string;
  extraHours: string;
  missingHours: string;
  nightShift: string;
}

// Propriedades do componente
interface PointsHistoryTableProps {
  entries: PointEntry[];
  onEdit: (entry: PointEntry) => void;
  className?: string;
}

const PointsHistoryTable = React.forwardRef<
  HTMLDivElement,
  PointsHistoryTableProps
>(({ entries, onEdit, className }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("p-6 shadow-xl rounded-xl", className)}
      style={{ boxShadow: "0px 0px 12px 4px rgba(0, 0, 0, 0.04)" }}
    >
      {/* Cabeçalho com informações da jornada de trabalho */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-3 md:py-2">
        <div className="flex flex-row md:flex-row items-start gap-2 md:gap-4">
          <h1 className="text-base md:text-lg font-bold">
            Jornada de Trabalho:
          </h1>
          <p className="text-base md:text-lg text-black">
            Segunda-feira a sexta-feira, das 8h15 até 17h50
          </p>
        </div>
        <div className="flex flex-row md:flex-row items-start gap-2 md:gap-4">
          <h1 className="text-base md:text-lg font-bold">
            Carga horária:
          </h1>
          <p className="text-base md:text-lg text-black">
            20h/semana - 450h/mês
          </p>
        </div>
      </div>

      {/* Tabela para todas as telas com rolagem horizontal */}
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader>
            <TableRow>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base p-6">
                DATA
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base px-9">
                PONTOS
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base">
                HORAS NORMAIS
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base">
                HORAS EXTRAS
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base">
                HORAS FALTANTES
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base">
                ADICIONAL NOTURNO
              </TableHead>
              <TableHead className="border border-gray-200 text-center font-bold text-black text-base">
                AÇÕES
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry, index) => (
              <TableRow
                key={index}
                className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
              >
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  <div className="flex flex-col items-center">
                    <div>{entry.date}</div>
                  </div>
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base ">
                  <div className="flex flex-col ">
                    <div>{entry.pointsMorning}</div>
                    <div>{entry.pointsAfternoon}</div>
                  </div>
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  {entry.normalHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  {entry.extraHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  {entry.missingHours}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  {entry.nightShift}
                </TableCell>
                <TableCell className="border border-gray-200 text-center text-black text-base">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="bg-[#FFC107] hover:bg-[#e0a800] text-white"
                    onClick={() => onEdit(entry)}
                  >
                    <PencilLine className="h-4 w-4 text-[#42130F]" />
                    <span className="sr-only">Editar</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
});
PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };