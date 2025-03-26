import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";

export default function TimeClock() {
  // Estado para o horário atual
  const [currentTime, setCurrentTime] = useState(new Date());

  // Estado para o fluxo de trabalho
  const [workState, setWorkState] = useState<"initial" | "entrada" | "inicioIntervalo" | "fimIntervalo">("initial");

  // Estado para rastrear o horário de entrada
  const [entryTime, setEntryTime] = useState<Date | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000); // Atualiza a cada 1000ms (1 segundo)

    return () => clearInterval(timer);
  }, []);

  // Formata o horário como HH:MM
  const formattedTime = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Verifica se está no horário restrito (23h às 4h)
  const currentHour = currentTime.getHours();
  const isRestrictedTime = currentHour >= 23 || currentHour < 4;

  // Funções para lidar com os cliques nos botões
  const handleEntrada = () => {
    if (!isRestrictedTime) {
      setWorkState("entrada");
      setEntryTime(new Date()); // Registra o horário de entrada
    }
  };

  const handleInicioIntervalo = () => {
    if (entryTime) {
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // Horas trabalhadas
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("inicioIntervalo");
      }
    }
  };

  const handleFimIntervalo = () => {
    setWorkState("fimIntervalo");
  };

  const handleSaida = () => {
    if (entryTime) {
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // Horas trabalhadas
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("initial");
        setEntryTime(null); // Reseta o horário de entrada
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
              className={`w-40 font-semibold ${!isRestrictedTime ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
              onClick={handleEntrada}
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
              className={`w-40 font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
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
              className="w-40 font-semibold bg-yellow-500 hover:bg-yellow-600 text-black"
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
              className={`w-40 font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-yellow-500 hover:bg-yellow-600 text-black" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
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