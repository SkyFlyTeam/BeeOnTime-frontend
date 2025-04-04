import TimeClockService from "./time-clock-service";
import { useEffect, useState } from "react";
import { Button } from "../../../../components/ui/button";
import { Clock } from "lucide-react";
import { getUsuario } from "@/services/authService";
import { set } from "react-hook-form";
import Horas from "@/interfaces/horas";
import { Usuario } from "@/interfaces/usuario";
import { horasServices } from "@/services/horasServices";
import HistPontos, { Ponto } from "@/interfaces/hisPonto";
import { pontoServices } from "@/services/pontoServices";
import { TipoPonto } from "@/enums/tipoPonto";

export default function TimeClock() {
  const [ usuario, setUsuario ] = useState<Usuario | null>(null);

  // Estado para o horário atual
  const [currentTime, setCurrentTime] = useState(new Date());
  const [ horasDia, setHorasDia ] = useState<Horas | null>(null);
  const [ diaAtual, setDiaAtual ] = useState<string | null>(null);
  const [ pontosDia, setPontosDia ] = useState<HistPontos | null | undefined>(undefined);
  const [ isWorkDay, setIsWorkDay ] = useState<boolean>(false)

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
      return data.data as Usuario
    }

    const fetchUsuario = async() => {
      try{
        let { data } = await getUsuario();
        setUsuario(data as Usuario);
      }catch(error){
        console.error('erro ao pegar usuario')
      }
    }

    const fetchHorasDia = async() => {
      try{
        const diaHojeLocal = new Date().toLocaleDateString("pt-BR", {
          timeZone: "America/Sao_Paulo", 
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        });
        
        // Converte para o formato YYYY-MM-DD
        const [day, month, year] = diaHojeLocal.split("/"); 
        const diaHoje = `${year}-${month}-${day}`;

        let horas  = await horasServices.getHorasByUsuarioAndDate(usuario?.usuario_cod!, diaHoje);
        setHorasDia(horas as Horas)
  
      }catch(error){
        console.error('erro ao pegar usuario')
      }
    }

    const fetchPontosDia = async(horas_cod: number) => {
      try{
        let data  = await pontoServices.getPontosByHorasCod(horas_cod);
        if ('pontos' in data) {
          setPontosDia(data as HistPontos);
        }else{
          setPontosDia(null)
        }
      }catch(error){
        console.error('erro ao pegar pontos')
      }
    }

    useEffect(() => {
      const carregarDados = async () => {
        await fetchUsuario(); 
        if (usuario) {
          const diaHojeLocal = new Date().toLocaleDateString("pt-BR", {
            timeZone: "America/Sao_Paulo", 
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          
          // Converte para o formato YYYY-MM-DD
          const [day, month, year] = diaHojeLocal.split("/"); 
          const diaHoje = `${year}-${month}-${day}`;

          setDiaAtual(diaHoje);

          await fetchHorasDia(); 
        }
      };
    
      carregarDados(); 
    }, [usuario?.usuario_cod]); 

    useEffect(() => {
      if (horasDia) {
        console.log('temos horas dias')
        setIsWorkDay(true);

        const carregarDados = async () => {
          await fetchPontosDia(horasDia.horasCod); 
        }

        if(horasDia.horasCod){
          carregarDados();
        }

      } else {
        console.log('nao temos horas dias')
        setIsWorkDay(false);
        setWorkState("initial");
      }
    }, [horasDia])

    useEffect(() => {
      console.log('effect do ponto', pontosDia)
      if(pontosDia){
        console.log('indo p atualizador')
        atualizarBotao(pontosDia)
      }else if(pontosDia == null){
        console.log('setando workspace')
        setWorkState("initial");
      }
    }, [pontosDia])

  const { verificarPontos } = TimeClockService();

  const atualizarBotao = (mpontos: HistPontos) => {
    let estado = verificarPontos(mpontos); // Await the promise
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

  // Formata o horário como HH:MM
  const formattedTime = currentTime.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const baterPonto = async(ponto: Ponto) => {
    try{
      await pontoServices.baterPonto(usuario!.usuario_cod, horasDia?.horasCod!, ponto);
    }catch(error){
      console.error('erro ao bater ponto')
    }
  }

  // Verifica se está no horário restrito (23h às 4h) ou se é o mesmo dia da última saída
  const currentHour = currentTime.getHours();
  const isTimeRestricted = currentHour >= 23 || currentHour < 4;
  const isSameDayAsExit = exitTime ? currentTime.getDate() === exitTime.getDate() : false;
  // const isRestrictedTime = isTimeRestricted || isSameDayAsExit;
  const isRestrictedTime = isSameDayAsExit;

  // Funções para lidar com os cliques nos botões
  const handleEntrada = async() => {
    if (!isRestrictedTime) {
      setWorkState("entrada");
      setEntryTime(new Date()); // Registra o horário de entrada
      let pontoHoras = currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
      let ponto_entrada: Ponto = {
        "tipoPonto": TipoPonto.ENTRADA,
        "horarioPonto": pontoHoras
      }
      baterPonto(ponto_entrada)
    }
  };

  const handleInicioIntervalo = async() => {
    if (entryTime) {
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); // Horas trabalhadas
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("inicioIntervalo");
      }
      let pontoHoras = currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
      let ponto_intervalo: Ponto = {
        "tipoPonto": TipoPonto.ALMOCO,
        "horarioPonto": pontoHoras
      }
      baterPonto(ponto_intervalo)
    }
  };

  const handleFimIntervalo = async() => {
    setWorkState("fimIntervalo");
    let pontoHoras = currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
    let ponto_intervalo: Ponto = {
      "tipoPonto": TipoPonto.ALMOCO,
      "horarioPonto": pontoHoras
    }
    baterPonto(ponto_intervalo)
  }
  

  const handleSaida = async() => {
    if (entryTime) {
      const hoursWorked = (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60); 
      if (hoursWorked >= 0) { // Ajustado para 0 para testar a qualquer hora
        setWorkState("initial");
        setEntryTime(null); // Reseta o horário de entrada
        setExitTime(new Date()); // Registra o horário de saída
        let pontoHoras = currentTime.toLocaleTimeString(navigator.language, {hour: '2-digit', minute:'2-digit'})
        let ponto_intervalo: Ponto = {
          "tipoPonto": TipoPonto.SAIDA,
          "horarioPonto": pontoHoras
        }
        baterPonto(ponto_intervalo)
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
              className={`w-44 py-5 text-md font-semibold ${!isRestrictedTime && isWorkDay  ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"}`}
              onClick={handleEntrada}
              variant="outline"
              disabled={isRestrictedTime || !isWorkDay}
            >
              ENTRADA
            </Button>
            <Button
              variant="outline"
              className="w-44 py-5 text-md font-semibold bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
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
              className="w-44 py-5 text-md font-semibold bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              SAÍDA
            </Button>
            <Button
              className={`w-44 py-5 text-md font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
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
              className="w-44 py-5 text-md font-semibold bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
              disabled
            >
              SAÍDA
            </Button>
            <Button
              className="w-44 py-5 text-md font-semibold bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]"
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
              className={`w-44 py-5 text-md font-semibold ${entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0 ? "bg-[#FFB503] hover:bg-[#FFCB50] text-[#42130F]" : "bg-gray-200 text-gray-600 cursor-not-allowed"}`}
              onClick={handleSaida}
              disabled={!(entryTime && (currentTime.getTime() - entryTime.getTime()) / (1000 * 60 * 60) >= 0)}
            >
              SAÍDA
            </Button>
            <Button
              variant="outline"
              className="w-44 py-5 text-md font-semibold bg-[#F0F0F0] text-gray-600 border-gray-400 cursor-not-allowed"
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
    <div className="flex-[2] min-w-fit bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-4 rounded-xl p-6">
      {/* Título */}
      <h1 className="text-xl font-semibold">Bater Ponto</h1>

      {/* Container dos botões */}
      <div className="flex gap-12 py-5">{renderButtons()}</div>

      {/* Relógio */}
      <div className="flex items-center gap-2">
        <Clock className="w-6 h-6 text-gray-600" />
        <span className="text-lg font-medium">{formattedTime}</span>
      </div>
    </div>
  );
}