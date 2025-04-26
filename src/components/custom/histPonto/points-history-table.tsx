"use client";
// General
import * as React from "react";
import { useEffect, useState } from "react";

// Utils
import { cn } from "@/lib/utils"; 

// Interfaces
import { Ponto } from "@/interfaces/marcacaoPonto";
import HistPontos from "@/interfaces/histPonto";
import { Usuario } from "@/interfaces/usuario";

// Components
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/custom/histPonto/table";
import { Button } from "@/components/ui/button";
import { PencilLine } from "lucide-react";
import ModalCriarSolicitacao from "../modalSolicitacao/modalEnvioSolicitacao";
import SolicitacaoInterface, { TipoSolicitacao } from "@/interfaces/Solicitacao";
import { solicitacaoServices } from "@/services/solicitacaoServices";
import Solicitacao from "@/interfaces/Solicitacao";

interface PointsHistoryTableProps {
  entries: HistPontos[] | null;
  onEdit: (entry: HistPontos) => void;
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
    const [selectedPonto, setSelectedPonto] = useState<HistPontos | null>(null); // Ponto selecionado
    const [diasJornada, setDiasJornada] = useState<string[]>([]);
    const [combinedEntries, setCombinedEntries] = useState<HistPontos[]>([]);
    const [solicitacoes, setSolicitacoes] = useState<SolicitacaoInterface[]>([]);
    const [solicitacaoHashMap, setSolicitacaoHashMap] = useState<any>();
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 5;

    React.useEffect(() => {
      if (userInfo?.jornadas?.jornada_diasSemana) {
        const dias = getUltimosDiasJornada(userInfo.jornadas.jornada_diasSemana);
        setDiasJornada(dias);
      }
    }, [userInfo]);

    React.useEffect(() => {
      const fetchSolicitacoes = async () => {
        try {
          const res = await solicitacaoServices.getAllSolicitacaoByUsuario(userInfo?.usuario_cod!);
          if (Array.isArray(res)) {
            setSolicitacoes(res); // agora sim, só salva o array
          } else {
            console.warn("Erro ao obter solicitações: retorno não é um array", res);
          }
        } catch (error) {
          console.log("Erro ao obter as solicitações:", error);
        }
      };
    
      if (userInfo?.usuario_cod) {
        fetchSolicitacoes();
      }
    }, [userInfo]);    

    React.useEffect(() => {
      if (!entries || !diasJornada.length) return;

      // Criar um mapa das entradas existentes por data formatada
      const entriesMap = new Map<string, HistPontos>();
      entries.forEach(entry => {
        const formattedDate = new Date(entry.data).toLocaleDateString("pt-BR");
        entriesMap.set(formattedDate, entry);
      });

      // Para cada dia de jornada, verificar se já existe uma entrada
      // Se não existir, criar uma entrada vazia para esse dia
      const newEntries: HistPontos[] = [];
      
      diasJornada.forEach(dataFormatada => {
        // Verificar se já existe uma entrada para essa data
        if (entriesMap.has(dataFormatada)) {
          newEntries.push(entriesMap.get(dataFormatada)!);
        } else {
          // Converter a data formatada DD/MM/YYYY para objeto Date
          const [day, month, year] = dataFormatada.split('/').map(Number);
          const dateObj = new Date(year, month - 1, day);

          // Criar uma nova entrada vazia para essa data
          const emptyEntry: HistPontos = {
            data: dateObj.toISOString(),
            pontos: [],
            horasTrabalhadas: 0,
            horasExtras: 0,
            horasFaltantes: 0,
            id: `empty-${dataFormatada}`,
            usuarioCod: userInfo?.usuario_cod!,
            horasCod: 0,
            horasNoturnas: 0,
            horasData: dateObj.toISOString(),
          };
          
          newEntries.push(emptyEntry);
        }
      });

      // Ordenar entradas por data (mais recente primeiro)
      newEntries.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      
      setCombinedEntries(newEntries.reverse());
    }, [entries, diasJornada]);

    const handleModalOpen = (entry: HistPontos) => {
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
      "OBSERVAÇÕES",
      ...(accessLevel === "USER" ? ["AÇÕES"] : []),
    ];

    const jornadaFormatada = () => {
      const diasDaSemanaSiglas = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
      const diasTrabalhados = userInfo?.jornadas.jornada_diasSemana
        .map((trabalha, index) => trabalha ? diasDaSemanaSiglas[index] : null)
        .filter((dia) => dia !== null);
      if (diasTrabalhados && diasTrabalhados.length > 0) {
        if(userInfo?.jornadas.jornada_horarioFlexivel){
          return `${diasTrabalhados.join(", ")}`;
        }else{
          return `${diasTrabalhados.join(", ")} das ${userInfo?.jornadas.jornada_horarioEntrada.toString().slice(0, 5)} até ${userInfo?.jornadas.jornada_horarioSaida.toString().slice(0, 5)}`;
        }
      } 
    };

    function criarMapaDeSolicitacoes(solicitacoes: Solicitacao[]): Record<string, string> {
      const mapa: Record<string, string> = {};
      
      const ENUMTipoSolicitacaoNome: Record<number, string> = {
          2: "Férias",
          3: "Folga",
          4: "Ausência Justificada",
      };
  
      solicitacoes.forEach((solicitacao) => {
        const dataFormatada = new Date(solicitacao.solicitacaoDataPeriodo).toISOString().split('T')[0];
        mapa[dataFormatada] = ENUMTipoSolicitacaoNome[solicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod];
      });
      
    
      return mapa;
  }
  

    useEffect(() => {
      if (solicitacoes.length > 0) {
        const mapa = criarMapaDeSolicitacoes(solicitacoes);
        setSolicitacaoHashMap(mapa);
      }
    }, [solicitacoes]);
    

    const { horasSemana, horasMes } = calculateCargaHoraria(userInfo?.usuario_cargaHoraria!, userInfo?.jornadas?.jornada_diasSemana?.filter(dia => dia).length ?? 0);

    const getUltimosDiasJornada = (jornada_diasSemana: boolean[]): string[] => {
      // Array para armazenar as datas da jornada
      const diasJornada: string[] = [];
      
      // Data atual
      const hoje = new Date();
      
      // Contador de dias
      let diasVerificados = 0;
      let diasEncontrados = 0;
      
      // Continua procurando até encontrar 100 dias de jornada ou verificar 200 dias para trás
      // (limite de 200 para evitar loop infinito caso existam poucos dias de jornada)
      while (diasEncontrados < 100 && diasVerificados < 200) {
        // Calcula a data a ser verificada (hoje - diasVerificados)
        const dataVerificada = new Date();
        dataVerificada.setDate(hoje.getDate() - diasVerificados);
        
        // Obtém o dia da semana (0 = Domingo, 1 = Segunda, ..., 6 = Sábado)
        let diaSemana = dataVerificada.getDay();
        
        // Converter para o formato da jornada_diasSemana (começa em segunda = 0)
        // 0 (Domingo) -> 6
        // 1 (Segunda) -> 0
        // 2 (Terça)   -> 1
        // etc.
        diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
        
        // Verifica se o dia faz parte da jornada
        if (jornada_diasSemana[diaSemana]) {
          // Formata a data (DD/MM/YYYY)
          const dia = String(dataVerificada.getDate()).padStart(2, "0");
          const mes = String(dataVerificada.getMonth() + 1).padStart(2, "0");
          const ano = dataVerificada.getFullYear();
          const dataFormatada = `${dia}/${mes}/${ano}`;
          
          // Adiciona ao array de dias de jornada
          diasJornada.push(dataFormatada);
          diasEncontrados++;
        }
        
        diasVerificados++;
      }
      
      return diasJornada;
    };

    const indexOfLastEntry = currentPage * entriesPerPage;
    const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
    const currentEntries = combinedEntries.slice(indexOfFirstEntry, indexOfLastEntry);

    const totalPages = Math.ceil(combinedEntries.length / entriesPerPage);

    return (
      <div ref={ref} className={cn("p-6 shadow-xl rounded-xl", className)} style={{ boxShadow: "0px 0px 12px 4px rgba(0, 0, 0, 0.04)" }}>
        {/* Cabeçalho da tabela com informações de jornada */}
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
              {currentEntries.map((entry, index) => (
                <TableRow key={index} className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                    {new Date(entry.data).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                    <div className="flex flex-col">
                      <div>{entry.pontos.map((ponto: Ponto) => `${ponto.horarioPonto.toString().substring(0, 5)}`).join(" - ")}</div>
                    </div>
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasTrabalhadas && entry.pontos.length > 0 ? 
                    ( <span> {entry.horasTrabalhadas} </span>
                    ) : (<span> 0 </span>)} 
                  </TableCell>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">{entry.horasExtras}</TableCell>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">{(-1) * (entry.horasTrabalhadas - userInfo?.usuario_cargaHoraria!)}</TableCell>
                  <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                    {entry.pontos.length > 0 ? (
                      <span> </span>
                    ) : solicitacaoHashMap && solicitacaoHashMap[((entry.data).toLocaleString("pt-BR").toString().split('T')[0])] ? (
                      <span> {solicitacaoHashMap[((entry.data).toLocaleString("pt-BR").toString().split('T')[0])]} </span>
                    ) : (
                      <span> Ausente </span>
                    )}
                  </TableCell>

                    
                    {/* {solicitacaoHashMap[(entry.data).toLocaleString("pt-BR")] || entry.pontos.length > 0 ? (
                      solicitacaoHashMap[(entry.data).toLocaleString("pt-BR")] 
                        ? <span> {ENUMTipoSolicitacaoNome[4]} </span>
                        : <span> {entry.pontos.length > 0 ? "" : "Ausente"} </span>
                    ) : (
                      <span> {entry.pontos.length === 0 ? "Ausência" : "Sem Observação"} </span>
                    )} */}

                  {accessLevel === "USER" && (
                    <TableCell className="border border-gray-200 text-center text-black text-base p-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="bg-[#FFC107] hover:bg-[#e0a800] text-white"
                        onClick={() => handleModalOpen(entry)}
                      >
                        <PencilLine className="h-4 w-4 text-[#42130F]" />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex justify-end items-center gap-2 mt-4">
            {/* Botão de página anterior */}
            <Button
              variant="outline"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((prev) => prev - 1)}
              className="w-8 h-8 p-0"
            >
              &lt;
            </Button>

            {/* Números das páginas */}
            {(() => {
              const maxVisiblePages = 3;
              const startPage = Math.max(1, currentPage - 1); // Página inicial para exibir (1 ou anterior à atual)
              const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1); // Última página a ser exibida

              return Array.from({ length: endPage - startPage + 1 }, (_, index) => {
                const pageNumber = startPage + index;
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`w-8 h-8 p-0 ${
                      currentPage === pageNumber
                        ? "bg-yellow-400 text-black hover:bg-yellow-500"
                        : ""
                    }`}
                  >
                    {pageNumber}
                  </Button>
                );
              });
            })()}

            {/* Botão de página próxima */}
            <Button
              variant="outline"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((prev) => prev + 1)}
              className="w-8 h-8 p-0"
            >
              &gt;
            </Button>
          </div>

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
