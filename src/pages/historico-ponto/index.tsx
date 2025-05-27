"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";

// Services
import { pontoServices } from "@/services/pontoServices"
import { horasServices } from "@/services/horasService";
import { usuarioServices } from "@/services/usuarioServices";
import { getUsuario } from "@/services/authService";

// Interfaces;
import { Usuario } from "@/interfaces/usuario";
import HistPontos from "@/interfaces/histPonto";
import Horas from "@/interfaces/horas";
import MarcacaoPonto from "@/interfaces/marcacaoPonto";

// Components
import { PointsHistoryTable } from "@/components/custom/histPonto/points-history-table";
import { Skeleton } from "@/components/ui/skeleton";
import CardBancoHoras from "./_components/CardBancoHoras/cardBancoHoras";
import EspelhoPontoCard from "@/components/custom/espelhoPontoCard/espelhoPontoCard";
import EspelhoPonto from "@/interfaces/espelhoPonto";
import { espelhoPontoService } from "@/services/espelhoPontoService";

//Date services
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalPDFViewer from "@/components/custom/PDFVizualizer/ModalPDFViewer";


export default function PointsHistoryPage() {
  //Simulando o diferente acesso
  const[accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER")
  const[ histPontos, setHistPontos ] = useState<HistPontos[] | null>(null)
  const [espelhoPontos, setEspelhoPontos] = useState<EspelhoPonto[] | null>(null)
  const [loading, setLoading] = useState(true); //Estado controle de carregamento
  const [selectedEspelhoPonto, setSelectedEspelhoPonto] = useState<EspelhoPonto | null>(null);

  const[usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null)

  const [pdfShowModal, setPdfShowModal] = useState(false);

  // const { usuarioCargo, usuarioCod } = useAuth(); 

  const handleEdit = (entry: HistPontos) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };

  const handleOpenEspelhoPontoModal = (espelhoPonto: EspelhoPonto) => {
    setSelectedEspelhoPonto(espelhoPonto);
    setPdfShowModal(true);
  } 

  // Função para combinar as horas e os pontos
  const fetchHistPontos = async (usuario_cod: number) => {
    try {
      // Buscar os pontos do usuário
      const pontos = await pontoServices.getPontosByUsuario(usuario_cod) as MarcacaoPonto[];

      // Buscar as horas do usuário
      const horas = await horasServices.getHorasByUsuario(usuario_cod) as Horas[];
  
      // Combinar as informações pelo 'horasCod', mas percorrendo as horas primeiro
      const combinedData = horas.map((hora: any) => {
        // Encontrar o ponto correspondente baseado no 'horasCod'
        const ponto = pontos.find((ponto: any) => ponto.horasCod === hora.horasCod);
  
        return {
          ...hora, // Spread the Horas data
          pontos: ponto ? ponto.pontos : [], // Add pontos data if it exists, else empty array
          horasExtras: hora?.horasExtras || 0,
          horasTrabalhadas: hora?.horasTrabalhadas || 0,
          horasNoturnas: hora?.horasNoturnas || 0,
          horasFaltantes: hora?.horasFaltantes || 0,
          horasData: hora?.horasData || '',
          usuarioCod: hora?.usuarioCod || 0,
        };
      });
  
      // Atualizar o estado com os dados combinados
      setHistPontos(combinedData);

    } catch (error) {
      console.log("Erro ao recuperar histórico de pontos do usuário de id " + usuario_cod);
    }
  };
  

  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod) as Usuario;
      setUsuarioInfo(usuario_data)
    } catch (error) {
      console.log("Erro ao recuperar usuário de id " + usuario_cod);
    }
  };

  const fetchEspelhosPonto = async (usuario_cod: number) => {
    try {
      const espelhoPonto_data = await espelhoPontoService.getAllEspelhoPontoById(usuario_cod) as EspelhoPonto[];
      setEspelhoPontos(espelhoPonto_data);
    } catch (error) {
      console.log("Erro ao recuperar espelhoPonto de id de usuário " + usuario_cod);
    }
  }

  const getUser = async () => {
    try {
      const user = await getUsuario();
      console.log(user);
      await fetchEspelhosPonto(user.data.usuario_cod);
      return user.data;
    } finally {
      setLoading(false)
    }
  }
  const SkeletonRow = () => (
    <div className="flex flex-row gap-6 mt-10 justify-between">
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-72 h-10" />
      <Skeleton className="bg-gray-200 w-48 h-10" />
      <Skeleton className="bg-gray-200 w-32 h-10" />
    </div>
  );

  // Utilize useEffect para chamar a função quando o componente for montado
  useEffect(() => {

    const onMount = async () => {
      const usuario = await getUser();

      if (usuario.nivelAcesso.nivelAcesso_cod !== 0) {
        fetchHistPontos(usuario.usuario_cod);
        fetchUsuario(usuario.usuario_cod);
      }
      else {
        setAccessLevel('ADM')
      }
    }

    onMount()
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col  p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Meus Pontos" : "Pontos"}
        </h1>
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
          <div className="flex flex-row justify-between">
            <Skeleton className="bg-gray-200 w-80 h-10" />
            <Skeleton className="bg-gray-200 w-96 h-10" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}


        </div>
      </div>
    )
  }
  return (
    <div>
    <div className="flex flex-col  p-6 md:p-9">
      <h1 className="text-xl md:text-3xl font-semibold mb-4">
        {accessLevel === "USER" ? "Meus Pontos" : "Pontos"}
      </h1>
      <PointsHistoryTable
        entries={histPontos}
        userInfo={usuarioInfo}
        onEdit={handleEdit}
        accessLevel={accessLevel}
      />
    </div>
    <div className="flex flex-col  p-6 md:p-9">
      <h2 className="text-xl md:text-3xl font-semibold mb-4">Espelho de ponto</h2>
      <div className="flex gap-4 overflow-x-auto whitespace-nowrap pb-2 min-h-[7rem]">
      {espelhoPontos!.map((espelho) => {
        const dataGeracao = new Date(espelho.espelhoPontoDataGeracao);
        const dataReal = subDays(dataGeracao, 1); // Subtrai um dia
        const mesAno = format(dataReal, "M/yy", { locale: ptBR }); // Ex: março/25

        return (
          <EspelhoPontoCard
            key={espelho.espelhoPontoCod}
            mesAno={espelho.espelhoPontoMes + mesAno.slice(1)} // Capitaliza o mês
            status={
              espelho.espelhoPontoAssinado
                ? "assinado"
                : "pendente"
            }
            onClick={() => {
              handleOpenEspelhoPontoModal(espelho);
            }}
          />
        );
      })}
      </div>
    </div>

    {selectedEspelhoPonto && (
    <ModalPDFViewer
      isOpen={pdfShowModal}
      onClose={() => setPdfShowModal(false)}
      usuarioCod={selectedEspelhoPonto!.usuarioCod}
      espelhoPontoCod={selectedEspelhoPonto!.espelhoPontoCod}
      mes={selectedEspelhoPonto!.espelhoPontoMes}
      usuarioNome={usuarioInfo!.usuario_nome}
      isEspelhoPontoAssinado={selectedEspelhoPonto.espelhoPontoAssinado}
      geracaoData={selectedEspelhoPonto.espelhoPontoDataGeracao}
      isUser={true}
    />
    )}
    </div>
  );
}