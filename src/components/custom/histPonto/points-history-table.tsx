"use client";

import * as React from "react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/custom/histPonto/table";
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
import ModalCriarSolicitacao from "../modal/modalEnvioSolicitacao";

interface PointsHistoryTableProps {
  entries: RelatorioPonto[] | null;
  onEdit: (entry: RelatorioPonto) => void;
  userInfo: Usuario | null;
  className?: string;
  accessLevel: "USER" | "ADM"; // Recebe o AccessLevel para diferentes acessos
}

// Função para formatar a data no formato brasileiro (DD/MM/YYYY)
const formatDate = (date: string): string => {
  const parsedDate = new Date(date);
  const day = String(parsedDate.getDate()).padStart(2, "0");
  const month = String(parsedDate.getMonth() + 1).padStart(2, "0");
  const year = parsedDate.getFullYear();
  return `${day}/${month}/${year}`;
};

// Função para calcular carga horária semanal e mensal
const calculateCargaHoraria = (horasDiarias: number, diasTrabalhados: number) => {
  const horasSemana = horasDiarias * diasTrabalhados; // Total de horas na semana
  const horasMes = horasSemana * 4; // Aproximadamente 4 semanas por mês
  return { horasSemana, horasMes };
};

const PointsHistoryTable = React.forwardRef<HTMLDivElement, PointsHistoryTableProps>(
  ({ entries, onEdit, userInfo, className, accessLevel }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false); // Estado para abrir/fechar o modal
    const [selectedPonto, setSelectedPonto] = useState<RelatorioPonto | null>(null); // Ponto selecionado

    const handleModalOpen = (entry: RelatorioPonto) => {
      setSelectedPonto(entry); // Seleciona o ponto para o modal
      setIsModalOpen(true); // Abre o modal
    };

    const handleModalClose = () => {
      setIsModalOpen(false); // Fecha o modal
      setSelectedPonto(null); // Limpa o ponto selecionado
    };

    const headers = [
      "DATA",
      "PONTOS",
      "HORAS NORMAIS",
      "HORAS EXTRAS",
      "HORAS FALTANTES",
      ...(accessLevel === "USER" ? ["AÇÕES"] : []),
    ];

    const jornadaFormatada = () => {
      const diasDaSemanaSiglas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      const diasTrabalhados = userInfo?.jornadas.jornada_diasSemana
        .map((trabalha, index) => trabalha ? diasDaSemanaSiglas[index] : null)
        .filter((dia) => dia !== null);
      if (diasTrabalhados && diasTrabalhados.length > 0) {
        return `${diasTrabalhados.join(", ")} das ${userInfo?.jornadas.jornada_horarioEntrada.toString().slice(0, 5)} até ${userInfo?.jornadas.jornada_horarioSaida.toString().slice(0, 5)}`;
      } else {
        return "Horário flexível";
      }
    };

    const { horasSemana, horasMes } = calculateCargaHoraria(userInfo?.usuario_cargaHoraria!, userInfo?.jornadas?.jornada_diasSemana?.filter(dia => dia).length ?? 0);

    return (
      <div ref={ref} className={cn("p-6 shadow-xl rounded-xl", className)} style={{ boxShadow: "0px 0px 12px 4px rgba(0, 0, 0, 0.04)" }}>
        {accessLevel === "USER" ? (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4 pb-3 md:py-2">
            <div className="flex flex-row items-start gap-2 md:gap-4">
              <h1 className="text-base md:text-lg font-bold">Jornada de Trabalho:</h1>
              <p className="text-base md:text-lg text-black">{jornadaFormatada()}</p>
            </div>
            <div className="flex flex-row items-start gap-2 md:gap-4">
              <h1 className="text-base md:text-lg font-bold">Carga horária:</h1>
              <p className="text-base md:text-lg text-black">{horasSemana}h/semana - {horasMes}h/mês</p>
            </div>
          </div>
        ) : (
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
                  <TableHead key={idx} className="border border-gray-200 text-center font-bold text-black text-base p-4">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries &&
                entries.map((entry, index) => (
                  <TableRow key={index} className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {new Date(entry.data).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      <div className="flex flex-col">
                        <div>{entry.pontos.map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`).join(" - ")}</div>
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasTrabalhadas}</TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasExtras}</TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasFaltantes}</TableCell>
                    {accessLevel === "USER" && (
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-[#FFC107] hover:bg-[#e0a800] text-white"
                          onClick={() => handleModalOpen(entry)} // Abre o modal com os dados do ponto
                        >
                          <PencilLine className="h-4 w-4 text-[#42130F]" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </div>

        {/* Modal */}
        {isModalOpen && selectedPonto && (
          <ModalCriarSolicitacao
            isOpen={isModalOpen}
            onClose={handleModalClose}
            ponto={selectedPonto}
          />
        )}
      </div>
    );
  }
);

PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };
