import { useEffect, useState } from "react";
import { ApiException } from '../../config/apiExceptions'

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

interface PointsHistoryTableProps {
  entries: HistPontos[] | null;
  onEdit: (entry: HistPontos) => void;
  userInfo: Usuario | null;
  className?: string;
  accessLevel: "USER" | "ADM"; // Recebe o AccessLevel para diferentes acessos
}

const PointsHistoryTable = React.forwardRef<HTMLDivElement, PointsHistoryTableProps>(
  ({ entries, onEdit, userInfo, className, accessLevel }, ref) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalAusenciaOpen, setIsModalAusenciaOpen] = useState(false);
    const [selectedPonto, setSelectedPonto] = useState<HistPontos | null>(null);
    const [selectedFalta, setSelectedFalta] = useState<Faltas | null>(null);
    const [faltas, setFaltas] = useState<{ [key: string]: boolean }>({}); // Store falta data for each entry

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

    return (
      <div ref={ref} className={"p-6 shadow-xl rounded-xl bg-white"}>
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
                      {new Date(entry.horasData).toLocaleDateString("pt-BR")}
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      <div className="flex flex-col">
                        {entry.pontos.length > 0 ? (
                        <div>{entry.pontos.map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`).join(" - ")}</div>
                        ) : (<div>---</div>)}
                      </div>
                    </TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasTrabalhadas}</TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasExtras}</TableCell>
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasFaltantes}</TableCell>
                    {accessLevel === "USER" && (
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                        {!faltas[entry.horasData.toLocaleString()] ? (
                          <div className={styles.relative}>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="relative bg-[#FFC107] hover:bg-[#e0a800] text-white"
                            onClick={() => handleModalOpen(entry)} // Open modal for the point
                          >
                            <PencilLine className="h-4 w-4 text-[#42130F]" />
                            <span className={styles.tooltip_text}>Solicitar ajuste</span> {/* Tooltip */}
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
                            <span className={styles.tooltip_text}>Justificar ausência</span> {/* Tooltip */}
                          </Button>
                          </div>
                        )}
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

        {isModalAusenciaOpen && selectedFalta && (
          <ModalCriarSolicitacaoFalta
            isOpen={isModalAusenciaOpen}
            onClose={handleModalAusenciaClose}
            falta={selectedFalta}
          />
        )}
      </div>
    );
  }
);

PointsHistoryTable.displayName = "PointsHistoryTable";

export { PointsHistoryTable };
