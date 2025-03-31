import TimeClockService from "./time-clock-service";
import { useEffect, useState } from "react";
import { Button } from "../../../components/ui/button";
import { Clock } from "lucide-react";
import { getUsuario } from "@/services/authService";
import { set } from "react-hook-form";

export default function TimeClock() {
  // Estado para o horário atual
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado para o fluxo de trabalho
  const [workState, setWorkState] = useState<"initial" | "entrada" | "inicioIntervalo" | "fimIntervalo" | "saida">("initial");

  // Estado para rastrear o horário de entrada
  const [entryTime, setEntryTime] = useState<Date | null>(null);

  // Estado para rastrear o horário de saída
  const [exitTime, setExitTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Atualiza a cada 1000ms (1 segundo)

    return () => clearInterval(timer);
  }, []);

    const getUser = async() => {
      const data = await getUsuario();
      return data.data
    }
  const { createHoras, baterEntrada, baterInicioAlmoco, baterSaidaAlmoco, baterSaida, verificarHoras } = TimeClockService();

  useEffect(() => {
    const diaHoje = new Date().toISOString().slice(0, 10);

    // You need to await the result of verificarHoras
    const fetchState = async () => {
          // Create hours (this doesn't seem to be affected by the state update)

      const user = await getUser()

    await createHoras({
      horasExtras: 0,
      horasTrabalhadas: 0,
      horasNoturnas: 0,
      horasFaltantes: 0,
      horasData: diaHoje,
      usuarioCod: user.usuario_cod,  // Example user ID
    }, diaHoje, user.usuario_cod);

      const estado = await verificarHoras(diaHoje, user.usuario_cod); // Await the promise
      if (estado == 'initial') {
        setWorkState(estado)
      }
      else if (estado == 'entrada') {
        setEntryTime(new Date()); // Registra o horário de entrada
        setWorkState(estado); // Now set workState with the resolved value
      }
      else if (estado == "inicioIntervalo") {
        setEntryTime(new Date()); // Registra o horário de entrada
        setWorkState(estado); // Now set workState with the resolved value
      }
      else if (estado == "fimIntervalo") {
        setEntryTime(new Date()); // Registra o horário de entrada
        setWorkState(estado); // Now set workState with the resolved value
      }
      else {
        setWorkState("initial");
        setEntryTime(null); // Reseta o horário de entrada
        setExitTime(new Date()); // Registra o horário de saída
      }
    };
  
    fetchState(); // Call the async function inside useEffect
  
  }, []); // Empty dependency array to run only once on component mount

  // Formata o horário como HH:MM
  const formattedTime = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Verifica se está no horário restrito (23h às 4h) ou se é o mesmo dia da última saída
  const currentHour = currentTime.getHours();
  const isTimeRestricted = currentHour >= 23 || currentHour < 4;
  const isSameDayAsExit = exitTime ? currentTime.getDate() === exitTime.getDate() : false;
  const isRestrictedTime = isTimeRestricted || isSameDayAsExit;

  // Funções para lidar com os cliques nos botões
  const handleEntrada = async() => {
    const diaHoje = new Date().toISOString().slice(0, 10);
    const user = await getUser()
    if (!isRestrictedTime) {
      setWorkState("entrada");
      setEntryTime(new Date()); // Registra o horário de entrada
      console.log(currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}))
      baterEntrada(diaHoje, currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}), user.usuario_cod)
    }
  };

  const handleInicioIntervalo = async() => {
    if (entryTime) {
      const user = await getUser()
      const diaHoje = new Date().toISOString().slice(0, 10);
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // Horas trabalhadas
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("inicioIntervalo");
      }
      baterInicioAlmoco(diaHoje, currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}), user.usuario_cod)
    }
  };

  const handleFimIntervalo = async() => {
    setWorkState("fimIntervalo");
    const user = await getUser()
    const diaHoje = new Date().toISOString().slice(0, 10);
    baterSaidaAlmoco(diaHoje, currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}), user.usuario_cod)
  };

  const handleSaida = async() => {
    if (entryTime) {
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // Horas trabalhadas
      const user = await getUser()
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("initial");
        setEntryTime(null); // Reseta o horário de entrada
        setExitTime(new Date()); // Registra o horário de saída
        const diaHoje = new Date().toISOString().slice(0, 10);
        baterSaida(diaHoje, currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'}), user.usuario_cod)
      }
    }
  };

  // Renderiza os botões com base no estado atual (seguindo exatamente os cards do Figma)
  const renderButtons = () => {
    switch (workState) {
      case "initial":
        // Frame 13 ou Frame 17 (dependendo do horário)
        return (
          <>
            <Button
              className={`w-40 font-semibold ${!isRestrictedTime ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"}`}
              onClick={handleEntrada}
              variant="outline"
              disabled={isRestrictedTime}
            >
              ENTRADA
            </Button>
            <Button
              variant="outline"
              className="w-40 bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              INÍCIO INTERVALO
            </Button>
          </>
        );
      case "entrada":
        // Frame 14
        return (
          <>
            <Button
              variant="outline"
              className="w-40 bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              SAÍDA
            </Button>
            <Button
              className={`w-40 font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
              onClick={handleInicioIntervalo}
              disabled={!(entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0)}
            >
              INÍCIO INTERVALO
            </Button>
          </>
        );
      case "inicioIntervalo":
        // Frame 16
        return (
          <>
            <Button
              variant="outline"
              className="w-40 bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              SAÍDA
            </Button>
            <Button
              className="w-40 font-semibold bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]"
              onClick={handleFimIntervalo}
            >
              FIM INTERVALO
            </Button>
          </>
        );
      case "fimIntervalo":
        // Frame 15
        return (
          <>
            <Button
              className={`w-40 font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
              onClick={handleSaida}
              disabled={!(entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0)}
            >
              SAÍDA
            </Button>
            <Button
              variant="outline"
              className="w-40 bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              INÍCIO INTERVALO
            </Button>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white shadow-xl flex flex-col items-center justify-center gap-4 rounded-xl p-6" style={{ boxShadow: "0px 0px 12px 4px rgba(0, 0, 0, 0.04);" }}>
      {/* Título */}
      <h1 className="text-xl font-semibold">Bater Ponto</h1>

      {/* Container dos botões */}
      <div className="flex gap-6 py-5">{renderButtons()}</div>

      {/* Relógio */}
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-gray-600" />
        <span className="text-lg font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}