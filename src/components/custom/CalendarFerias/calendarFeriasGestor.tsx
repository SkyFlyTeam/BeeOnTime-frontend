import { useEffect, useState } from "react";
import styles from "./SimpleCalendar.module.css";
import { Input } from "@/components/ui/input";
import { FaPaperclip } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import SolicitacaoInterface from "@/interfaces/Solicitacao";
import { getUsuario } from "@/services/authService";
import { solicitacaoServices } from "@/services/solicitacaoServices";
import { toast } from "react-toastify"; // Importando o toast

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

interface CalendarFeriasGestorProps {
  userPedido: number;
}

const CalendarFeriasGestor = ({userPedido}: CalendarFeriasGestorProps) => {
  const [userCod, setUserCod] = useState<number>()
  const [selectedDates, setSelectedDates] = useState<Date[][]>([]);
  const periodos = ["30 Dias", "15 e 15 Dias", "20 e 10 Dias", "10, 15 e 5 Dias"];
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [solicitacoes, setSolicitacoes] = useState<any[]>([])
  const [justificativaDigitada, setJustificativaDigitada] = useState<string>("")

  useEffect(() => {
    getUser()
  }, [])

  useEffect(() => {
    const getAllSolicitacaoByUsuario = async (userPedido: number) => {

      const data = await solicitacaoServices.getAllSolicitacaoByUsuario(userPedido) as any[];
      
      const solicitacoesFiltradas = data.filter(
        (solicitacao: { solicitacaoStatus: string; tipoSolicitacaoCod: { tipoSolicitacaoCod: number } }) =>
          solicitacao.solicitacaoStatus === "PENDENTE" &&
          solicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod === 2
      )
  
      setSolicitacoes(solicitacoesFiltradas);
    };
  
    if (userPedido) {
      getAllSolicitacaoByUsuario(userPedido);
    }
  }, [userPedido]);
  
  const getUser = async () => {
    try {
      const user = await getUsuario();
      console.log("Usuário retornado:", user);
      const usuario = user.data;
      setUserCod(usuario.usuario_cod);
    } catch (error) {
      console.error("Error fetching user data", error);
    }
  };

  useEffect(() => {
    if (solicitacoes.length > 0) {
      // Pega a primeira data das solicitações
      const primeiraSolicitacao = solicitacoes[0];
      if (primeiraSolicitacao.solicitacaoDataPeriodo) {
        const [dayStr, monthStr, yearStr] = primeiraSolicitacao.solicitacaoDataPeriodo.split("-");
        const data = new Date(+yearStr, +monthStr - 1, +dayStr);
        setCurrentDate(new Date(data.getFullYear(), data.getMonth(), 1));
        return;
      }
    }
    
    // Se não houver solicitações, usa o plano normal (60 dias à frente)
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    futureDate.setHours(0, 0, 0, 0);
    setCurrentDate(new Date(futureDate.getFullYear(), futureDate.getMonth(), 1));
  }, [solicitacoes]);
  
    
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const [stepIndex, setStepIndex] = useState(0);
  
  const daysInMonth = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const firstDay = getFirstDayOfMonth(currentDate);

  const calendarDays = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const isSameDay = (date1: Date, date2: Date) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  // Função para atualizar o status de todas as solicitações
  const handleUpdateStatus = async (status: number) => {
    if (solicitacoes.length === 0) {
      toast.info("Não há solicitações para atualizar", {
        position: "top-right",
        autoClose: 2000,
      });
      return;
    }
    
    try {
      const updatedSolicitacoes = await Promise.all(
        solicitacoes.map(async (solicitacao) => {
          // Converte o status numérico para string conforme esperado pelo serviço
          const statusString = status === 1 ? "APROVADA" : "REPROVADA";
          
          // Prepara o objeto para atualização com a justificativa digitada
          const updatedSolicitacao = {
            ...solicitacao,
            solicitacaoStatus: statusString,
            solicitacaoMensagem: justificativaDigitada || solicitacao.solicitacaoMensagem
          };
          
          return await solicitacaoServices.updateSolicitacao(updatedSolicitacao);
        })
      );
      
      console.log("Solicitações atualizadas com sucesso:", updatedSolicitacoes);
      
      // Atualiza a lista local de solicitações removendo as que foram processadas
      setSolicitacoes([]);
      setJustificativaDigitada("");
      
      // Mostra o toast de sucesso ao invés do alert
      if (status === 1) {
        toast.success("Solicitações de férias aprovadas com sucesso!", {
          position: "top-right",
          autoClose: 2000,
        });
      } else {
        toast.success("Solicitações de férias recusadas com sucesso!", {
          position: "top-right",
          autoClose: 2000,
        });
      }
      
    } catch (error) {
      console.error("Erro ao atualizar solicitações:", error);
      toast.error("Erro ao processar solicitações. Verifique o console para mais detalhes.", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div>
      <div style={{
        border: "2px solid rgba(0,0,0,0.15)",
        borderRadius: "6px",
        display: "flex",
        justifyContent: "space-between",
        padding: "10px",
      }}>
        {periodos.map((periodo) => (
          <button
            key={periodo}
            className={""}
            style={{ width: "23%", borderRadius: "3px" }}
          >
            {periodo}
          </button>
        ))}
      </div>

      {selectedDates.map((bloco, blocoIdx) => (
        <div key={blocoIdx} style={{ marginBottom: 8 }}>
          <strong>Bloco {blocoIdx + 1}:</strong>{" "}
          {bloco.map((dia, idx) => (
            <span key={idx} style={{ marginRight: 8 }}>
              {dia.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              }).replace(".", "")}
            </span>
          ))}
        </div>
      ))}

      <div className={styles.calendar}>
        <div className={styles.header}>
          <button onClick={handlePrevMonth}>{"<"}</button>
          <h2>{currentDate.toLocaleString("pt-BR", { month: "long" })}</h2>
          <button onClick={handleNextMonth}>{">"}</button>
        </div>

        <div className={styles.weekdays}>
          {weekDays.map((day) => (
            <div key={day} className={styles.weekday}>{day}</div>
          ))}
        </div>

        <div className={styles.days}>
          {calendarDays.map((day, idx) => {
            if (day === null) {
              return <div key={idx} className={styles.day}></div>;
            }

            const cellDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            
            const isSolicitacaoDay = solicitacoes.some((solicitacao) => {
              if (!solicitacao.solicitacaoDataPeriodo) return false;
              const [dayStr, monthStr, yearStr] = solicitacao.solicitacaoDataPeriodo.split("-");
              const solicitacaoDate = new Date(+yearStr, +monthStr - 1, +dayStr);
              return isSameDay(solicitacaoDate, cellDate);
            });

            return (
              <div
                key={idx}
                className={`${styles.day} ${isSolicitacaoDay ? styles.selectedDay : ""}`}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>
      Justificativa
      <div className="flex w-full gap-2 items-center" style={{ marginTop: "2%" }}>
        <Input
          className="flex-1 h-10"
          value={justificativaDigitada.toString()}
          onChange={(e) => setJustificativaDigitada(e.target.value)}
        />

        {/* Botão de anexo */}
        {/* <label htmlFor="anexo" className="cursor-pointer flex items-center justify-center h-10 w-10">
          <FaPaperclip className="text-gray-500" />
        </label>
        <input
          type="file"
          id="anexo"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              // Exemplo: enviar arquivo ou exibir nome
              console.log("Arquivo selecionado:", file.name);
              toast.success("Arquivo anexado: " + file.name, { autoClose: 2000 });
            }
          }}
        /> */}
      </div>
        
      <div style={{ marginTop: "2%", display: "flex", justifyContent: "flex-end", gap: "10px" }}>
        <Button 
          variant="outline"
          style={{ paddingRight: "6%", paddingLeft: "6%", border: "1px #dc2626 solid", color: "#dc2626" }} 
          onClick={() => handleUpdateStatus(2)}
        >
          Recusar
        </Button>
        <Button 
          variant="outline"
          style={{ paddingRight: "6%", paddingLeft: "6%", border: "1px #16a34a solid", color: "#16a34a" }} 
          onClick={() => handleUpdateStatus(1)}
        >
          Aprovar
        </Button>
      </div>
    </div>
  );
};

export default CalendarFeriasGestor;