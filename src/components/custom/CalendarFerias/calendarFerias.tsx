import { useEffect, useState } from "react";
import styles from "./SimpleCalendar.module.css";
import { Input } from "@/components/ui/input";
import { FaPaperclip } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import SolicitacaoInterface from "@/interfaces/Solicitacao";
import { getUsuario } from "@/services/authService";
import { solicitacaoServices } from "@/services/solicitacaoServices";
import { toast } from "react-toastify"; // Importando o toast
import { ApiException } from "@/config/apiExceptions";

const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];
const periodoDict = {"30 Dias": 0, "15 e 15 Dias": 1, "20 e 10 Dias": 2, "10, 15 e 5 Dias": 3}

interface CalendarFeriasProps {
  isEdicao?: boolean;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}

const CalendarFerias: React.FC<CalendarFeriasProps> = ({ isEdicao, onSolicitacaoUpdate }) => {
  const [userCod, setUserCod] = useState<number>()
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("30 Dias");
  const [selectedDates, setSelectedDates] = useState<Date[][]>([]);
  const periodos = ["30 Dias", "15 e 15 Dias", "20 e 10 Dias", "10, 15 e 5 Dias"];
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [solicitacoes, setSolicitacoes] = useState<SolicitacaoInterface[]>([])
  const [justificativaDigitada, setJustificativaDigitada] = useState<string>("")
  const [anexo, setAnexo] = useState<File | null>(null);


  useEffect(() => {
    getUser()
  }, [])

  const getUser = async () => {
    try {
      const user = await getUsuario();
      console.log("Usuário retornado:", user);
      const usuario = user.data;
      setUserCod(usuario.usuario_cod);
    } catch (error) {
      console.error("Error fetching user data", error);
      toast.error("Erro ao carregar dados do usuário", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  useEffect(() => {
    setSelectedDates([]);
    setStepIndex(0);
  }, [selectedPeriodo]);

  useEffect(() => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 60);
    futureDate.setHours(0, 0, 0, 0);
    setCurrentDate(new Date(futureDate.getFullYear(), futureDate.getMonth(), 1));
  }, []);
    
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

  const diasPorBloco = selectedPeriodo
  .match(/\d+/g)?.map(Number) || [30];

  const [stepIndex, setStepIndex] = useState(0);

  const handleDayClick = (day: number | null) => {
    if (!day || stepIndex >= diasPorBloco.length) return;
  
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
  
    const minSelectableDate = new Date();
    minSelectableDate.setDate(minSelectableDate.getDate() + 60);
    minSelectableDate.setHours(0, 0, 0, 0);

    if (clickedDate < minSelectableDate) {
      toast.info("Só é possível selecionar datas com mais de 60 dias de antecedência", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const daysToSelect = diasPorBloco[stepIndex];
    const totalDiasSelecionados = selectedDates.reduce((acc, bloco) => acc + bloco.length, 0);
    const totalDiasPermitidos = diasPorBloco.reduce((acc, cur) => acc + cur, 0);
    if (totalDiasSelecionados + daysToSelect > totalDiasPermitidos) {
      toast.warning(`Limite de ${totalDiasPermitidos} dias atingido para o período selecionado`, {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }
  
    const newDates: Date[] = [];
  
    for (let i = 0; i < daysToSelect; i++) {
      const dateToAdd = new Date(clickedDate);
      dateToAdd.setDate(dateToAdd.getDate() + i);
      newDates.push(dateToAdd);
    }
  
    setSelectedDates(prev => [...prev, newDates]);
    
    toast.success(`Bloco de ${daysToSelect} dias selecionado com sucesso`, {
      position: "top-right",
      autoClose: 2000,
    });
  
    if (stepIndex + 1 < diasPorBloco.length) {
      setStepIndex(stepIndex + 1);
    } else {
      setStepIndex(0);
    }
  };
  
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

  // const handleSubmit = async () => {
  //   if (!userCod) {
  //     toast.error("Usuário não identificado", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     return;
  //   }
    
  //   if (selectedDates.length === 0) {
  //     toast.warning("Selecione pelo menos um período de férias", {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
  //     return;
  //   }
    
  //   const justificativa = justificativaDigitada;
  //   const anexo = null;
    
  //   // Pega cada dia individualmente, não em blocos
  //   const allSelectedDates = selectedDates.flat(); // Junta todos os blocos em um array único
    
  //   const promises = allSelectedDates.map(async (data) => {

  //     const formData = new FormData();
  //     formData.append("solicitacaoJson", JSON.stringify({
  //       solicitacaoMensagem: justificativa,
  //       solicitacaoDataPeriodo: data, // agora uma única data por vez
  //       usuarioCod: userCod,
  //       tipoSolicitacaoCod: { tipoSolicitacaoCod: 2 }
  //     }));
    
  //     if (anexo) {
  //       formData.append("solicitacaoAnexo", anexo);
  //     }
    
  //     return solicitacaoServices.createSolicitacao(formData);
  //   });
    
  //   try {
  //     toast.info("Enviando solicitações...", {
  //       position: "top-right",
  //       autoClose: 2000,
  //     });
      
  //     const results = await Promise.all(promises);
  //     setSolicitacoes(results as SolicitacaoInterface[]);
  //     setSelectedDates([]);
  //     setJustificativaDigitada("");
      
  //     toast.success(`Solicitação de férias enviadas com sucesso!`, {
  //       position: "top-right",
  //       autoClose: 3000,
  //     });
      
  //     console.log("Solicitações enviadas com sucesso:", results);
  //   } catch (error) {
  //     console.error("Erro ao enviar solicitações:", error);
  //     toast.error("Erro ao enviar solicitações. Verifique o console para mais detalhes.", {
  //       position: "top-right",
  //       autoClose: 4000,
  //     });
  //   }
  // };

  const handleSubmit = async () => {
    if (!userCod) {
      toast.error("Usuário não identificado", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    if (selectedDates.length === 0) {
      toast.warning("Selecione pelo menos um período de férias", {
        position: "top-right",
        autoClose: 3000,
      });
      return;
    }

    const justificativa = justificativaDigitada;
    const allSelectedDates = selectedDates.flat(); // Junta todos os blocos
    const anexar = anexo;

    try {
      if (isEdicao) {
        console.log(userCod)
        const solicitacoesAntigas = await solicitacaoServices.getAllSolicitacaoByUsuario(userCod);

      if (Array.isArray(solicitacoesAntigas)) {
        const solicitacoesParaDeletar = solicitacoesAntigas.filter(
          (s: SolicitacaoInterface) =>
            s.tipoSolicitacaoCod.tipoSolicitacaoCod === 2 && s.solicitacaoStatus === 'PENDENTE'
        );

        console.log("sol del", solicitacoesParaDeletar)
        const deletarPromises = solicitacoesParaDeletar.map((s: SolicitacaoInterface) =>
          solicitacaoServices.deleteSolicitacao(s.solicitacaoCod)
        );
        await Promise.all(deletarPromises);
      }
    }

      // 📦 Enviar novas solicitações
      toast.info("Enviando novas solicitações...", {
        position: "top-right",
        autoClose: 2000,
      });

      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify({
        solicitacaoMensagem: justificativa,
        solicitacaoDataPeriodo: allSelectedDates.map(date =>
          date.toISOString().split("T")[0] // transforma para formato "YYYY-MM-DD"
        ),
        usuarioCod: userCod,
        tipoSolicitacaoCod: { tipoSolicitacaoCod: 2 },
      }));

      if (anexar) {
        formData.append("solicitacaoAnexo", anexar);
      }

      let res;

      try {
        const result = await solicitacaoServices.createSolicitacao(formData);
        res = result;
        if (result instanceof ApiException) {
          console.error(result.message);
        } else {
          setSolicitacoes([result]);
        }

        setSelectedDates([]);
        setJustificativaDigitada("");

      } catch (error) {
        console.error("Erro ao enviar solicitação:", error);
        toast.error("Erro ao enviar solicitação. Verifique o console para mais detalhes.", {
          position: "top-right",
          autoClose: 4000,
        });
      }

      if (res instanceof ApiException || res === undefined) {
        console.log("Error!")
      }
      else {
        setSolicitacoes([res]);
      }
      setSelectedDates([]);
      setJustificativaDigitada("");

      toast.success("Solicitações de férias enviadas com sucesso!", {
        position: "top-right",
        autoClose: 3000,
      });
      if (!(res instanceof ApiException) && onSolicitacaoUpdate && res) {
        onSolicitacaoUpdate(res);
      }
      console.log("Solicitações enviadas:", res);
    } catch (error) {
      console.error("Erro ao enviar solicitações:", error);
      toast.error("Erro ao enviar solicitações. Verifique o console para mais detalhes.", {
        position: "top-right",
        autoClose: 4000,
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
            onClick={() => {
              setSelectedPeriodo(periodo);
              setSelectedDates([]);
            }}
            className={selectedPeriodo === periodo ? styles.selected_button : ""}
            style={{ width: "23%", borderRadius: "3px" }}
          >
            {periodo}
          </button>
        ))}
      </div>

      <p className={styles.label_calendario}>Selecionar dias:</p>

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
            const now = new Date();
            now.setHours(0, 0, 0, 0);

            const isSelected = selectedDates.some((bloco) =>
              bloco.some((selectedDate) => isSameDay(selectedDate, cellDate))
            );            

            const isPast = cellDate < now;
            
            const minSelectableDate = new Date();
            minSelectableDate.setDate(minSelectableDate.getDate() + 60);
            minSelectableDate.setHours(0, 0, 0, 0);
            const isDisabled = cellDate < minSelectableDate;

            return (
              <div
                key={idx}
                className={`${styles.day} ${isSelected ? styles.selectedDay : ""} ${isDisabled ? styles.disabled : ""}`}
                onClick={() => !isDisabled && handleDayClick(day)}
              >
                {day}
              </div>
            );
          })}
        </div>
      </div>

      Justificativa
      <div className="flex w-full gap-2 items-center" style={{marginTop: "2%"}}>
        <Input
          className="flex-1 h-10"
          value={justificativaDigitada.toString()}
          onChange={(e) => setJustificativaDigitada(e.target.value)}
        />
        <label className="flex items-center justify-center h-10 w-10 cursor-pointer relative">
          <FaPaperclip className="text-gray-500" />
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setAnexo(file);
            }}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
        </label>

      </div>

        
      <div style={{ marginTop: "2%", display: "flex", justifyContent: "flex-end"}}>
        <Button style={{paddingRight: "6%", paddingLeft: "6%"}} onClick={handleSubmit}>
          Enviar
        </Button>
      </div>
    </div>
  );
};

export default CalendarFerias;