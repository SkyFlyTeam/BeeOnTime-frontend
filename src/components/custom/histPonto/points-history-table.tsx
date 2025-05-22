import { useEffect, useState } from "react";
// import { ApiException } from '../../config/apiExceptions'

// Interfaces
import { Ponto } from "@/interfaces/marcacaoPonto";
import HistPontos from "@/interfaces/histPonto";
import { Usuario } from "@/interfaces/usuario";

// Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/custom/histPonto/table";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import ModalCriarSolicitacao from "../modalSolicitacao/modalEnvioSolicitacao";
import { faltaServices } from "@/services/faltaService";
import React from "react";
import Faltas from "@/interfaces/faltas";
import ModalCriarSolicitacaoFalta from "../modalSolicitacao/modalEnvioSolicitacaoFalta";

import styles from "./styles.module.css"
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import TablePagination from "../TablePagination/TablePagination";

dayjs.extend(utc);
dayjs.extend(timezone);


interface PointsHistoryTableProps {
  entries: HistPontos[] | null;
  onEdit: (entry: HistPontos) => void;
  userInfo: Usuario | null;
  className?: string;
  accessLevel: "USER" | "ADM"; // Recebe o AccessLevel para diferentes acessos
}

const PointsHistoryTable = React.forwardRef<HTMLDivElement, PointsHistoryTableProps>(
  ({ entries, onEdit, userInfo, className, accessLevel }, ref) => {
    if (!userInfo)
      return;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAusenciaOpen, setIsModalAusenciaOpen] = useState(false);
    const [selectedPonto, setSelectedPonto] = useState<HistPontos | null>(null);
    const [selectedFalta, setSelectedFalta] = useState<Faltas | null>(null);
    const [faltas, setFaltas] = useState<{ [key: string]: boolean }>({}); // Store falta data for each entry

    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10; // Altere se quiser mais ou menos por página

    const totalPages = entries ? Math.ceil(entries.length / rowsPerPage) : 0;

    // Corta os dados para mostrar apenas os da página atual
    const paginatedEntries = entries
      ? entries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage)
      : [];


    const fetchFaltas = async () => {
      try {
        const faltaData: { [key: string]: any } = {};  // Initialize an object to store the full Falta objects
        if (entries) {
          for (const entry of entries) {
            const falta = await faltaServices.getFaltabyUsuarioCodAndDate(userInfo!.usuario_cod, entry.horasData.toLocaleString());
            faltaData[entry.horasData.toLocaleString()] = falta || null;  // Store the full Falta object or null
          }
        }
        setFaltas(faltaData);  // Set the fetched falta data
      } catch (error) {
        console.error("Error fetching falta data:", error);
      }
    };



    useEffect(() => {
      // Fetch faltas when the component mounts or entries change
      fetchFaltas();
    }, [entries]);

    const handleModalOpen = (entry: HistPontos) => {
      setSelectedPonto(entry);
      setIsModalOpen(true);
    };

    const handleModalClose = () => {
      setIsModalOpen(false);
      setSelectedPonto(null);
    };

    const handleModalAusenciaOpen = (entry: any) => {
      setSelectedFalta(entry);
      setIsModalAusenciaOpen(true);
    };

    const handleModalAusenciaClose = () => {
      setIsModalAusenciaOpen(false);
      setSelectedFalta(null);
    };

    const headers = [
      "DATA",
      "PONTOS",
      "HORAS NORMAIS",
      "HORAS EXTRAS",
      "HORAS FALTANTES",
      ...(accessLevel === "USER" ? ["AÇÕES"] : []),
    ];

    // Função para calcular carga horária semanal e mensal
    const calculateCargaHoraria = (horasDiarias: number, diasTrabalhados: number) => {
      const horasSemana = horasDiarias * diasTrabalhados; // Total de horas na semana
      const horasMes = horasSemana * 4; // Aproximadamente 4 semanas por mês
      return { horasSemana, horasMes };
    };

    const jornadaFormatada = () => {
      if (userInfo.jornadas.jornada_horarioFlexivel)
        return "Horário flexível";
    
      const diasDaSemanaSiglas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      const diasTrabalhados = userInfo.jornadas.jornada_diasSemana
        .map((trabalha, index) => trabalha ? diasDaSemanaSiglas[index] : null)
        .filter((dia) => dia !== null);
    
      const entrada = userInfo.jornadas.jornada_horarioEntrada 
        ? userInfo.jornadas.jornada_horarioEntrada.toString().slice(0, 5) 
        : "--:--";
      const saida = userInfo.jornadas.jornada_horarioSaida 
        ? userInfo.jornadas.jornada_horarioSaida.toString().slice(0, 5) 
        : "--:--";
    
      return `${diasTrabalhados.join(", ")} das ${entrada} até ${saida}`;
    };
    

    const { horasSemana, horasMes } = calculateCargaHoraria(userInfo.usuario_cargaHoraria!, userInfo.jornadas.jornada_diasSemana?.filter(dia => dia).length ?? 0);

    return (
      <div ref={ref} className={"p-6 shadow-xl rounded-xl bg-white"}>

        {/* Desktop - Tabela horizontal */}
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
              {paginatedEntries.length > 0 ? (
                paginatedEntries.map((entry, index) => (
                  <TableRow
                    key={index}
                    className={
                      (index + (currentPage - 1) * rowsPerPage) % 2 === 0
                        ? "bg-[#FFF8E1] hover:bg-orange-200"
                        : "bg-[#FFFFFF] hover:bg-orange-200"
                    }
                  >
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {dayjs(entry.horasData).tz("America/Sao_Paulo").format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      <div className="flex flex-col">
                        {entry.pontos.length > 0 ? (
                          <div>
                            {entry.pontos
                              .map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`)
                              .join(" - ")}
                          </div>
                        ) : (
                          <div>---</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasTrabalhadas.toFixed(0)}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasExtras.toFixed(0)}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      {entry.horasFaltantes.toFixed(0)}
                    </TableCell>
                    {accessLevel === "USER" && (
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                        {!faltas[entry.horasData.toLocaleString()] ? (
                          <div className={styles.relative}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                              onClick={() => handleModalOpen(entry)}
                            >
                              <PencilLine className="h-4 w-4 text-[#42130F]" />
                              <span className={styles.tooltip_text}>Solicitar ajuste</span>
                            </Button>
                          </div>
                        ) : (
                          <div className={styles.relative}>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                              onClick={() => handleModalAusenciaOpen(faltas[entry.horasData.toLocaleString()])}
                            >
                              <PencilLine className="h-4 w-4 text-[#42130F]" />
                              <span className={styles.tooltip_text}>Justificar ausência</span>
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="h-24 text-center">
                    <div className="flex flex-col p-5 w-full justify-center items-center">
                      <img src="/images/sem_conteudo.svg" alt="Sem conteúdo" style={{ width: "30rem", height: "20rem" }} />
                      <p className="font-medium">Ops! Parece que não tem nada aqui!</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

        </div>

        {/* Mobile - Tabela transposta */}
        <div className="block md:hidden overflow-x-auto mt-4">
          <Table className="min-w-[700px] w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="border border-gray-200 text-center font-bold text-black  p-4">
                  DATA
                </TableHead>
                
                {paginatedEntries.map((entry, index) => (
                  <TableHead
                    key={index}
                    className={`border border-gray-200 text-center  text-black  p-4 ${(index + (currentPage - 1) * rowsPerPage) % 2 === 0
                        ? "bg-[#FFF8E1]"
                        : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {dayjs(entry.horasData).tz("America/Sao_Paulo").format("DD/MM/YYYY")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-bold p-3 ">PONTOS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.pontos.length > 0
                      ? entry.pontos.map((ponto: Ponto) => ponto.horarioPonto.substring(0, 5)).join(" - ")
                      : "---"}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-bold p-3 ">HORAS NORMAIS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasTrabalhadas.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-semibold p-3 ">HORAS EXTRAS:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasExtras.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              <TableRow className="">
                <TableCell className="border border-gray-200 text-center font-semibold p-3 ">HORAS FALTANTES:</TableCell>
                {paginatedEntries.map((entry, idx) => (
                  <TableCell
                    key={idx}
                    className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                      } hover:bg-orange-200`}
                  >
                    {entry.horasFaltantes.toFixed(0)}
                  </TableCell>
                ))}
              </TableRow>

              {accessLevel === "USER" && (
                <TableRow className="">
                  <TableCell className="border border-gray-200 text-center font-bold p-3 ">AÇÕES:</TableCell>
                  {paginatedEntries.map((entry, idx) => (
                    <TableCell
                      key={idx}
                      className={`border border-gray-200 text-center p-3 ${(idx + (currentPage - 1) * rowsPerPage) % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"
                        } hover:bg-orange-200`}
                    >
                      {!faltas[entry.horasData.toLocaleString()] ? (
                        <div className={styles.relative}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => handleModalOpen(entry)}
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                            <span className={styles.tooltip_text}>Solicitar ajuste</span>
                          </Button>
                        </div>
                      ) : (
                        <div className={styles.relative}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => handleModalAusenciaOpen(faltas[entry.horasData.toLocaleString()])}
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                            <span className={styles.tooltip_text}>Justificar ausência</span>
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )}
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

        {isModalAusenciaOpen && selectedFalta && (
          <ModalCriarSolicitacaoFalta
            isOpen={isModalAusenciaOpen}
            onClose={handleModalAusenciaClose}
            falta={selectedFalta}
          />
        )}

        <div className="flex justify-end w-full mt-6">
          <div className="">
            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(page: number) => setCurrentPage(page)}
              showPreviousNext
            />
          </div>
        </div>
      </div>

    );
  }
);

PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };
