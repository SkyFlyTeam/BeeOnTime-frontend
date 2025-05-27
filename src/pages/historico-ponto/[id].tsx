"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// Interfaces
import MarcacaoPonto from "@/interfaces/marcacaoPonto";
import HistPonto from "@/interfaces/histPonto";
import { Usuario } from "@/interfaces/usuario";
import Horas from "@/interfaces/horas";

// Services
import { pontoServices } from "@/services/pontoServices";
import { horasServices } from "@/services/horasService";
import { getUsuario } from "@/services/authService";
import { usuarioServices } from "@/services/usuarioServices";

// Components
import { PointsHistoryTable } from "@/components/custom/histPonto/points-history-table";
import EditarFuncionarioForm from "@/components/custom/CardEditarFuncionario/editarFuncionarioForm";
import CardBancoHoras from "./_components/CardBancoHoras/cardBancoHoras";
import { Skeleton } from "@/components/ui/skeleton";
import { ToastContainer } from "react-toastify";
import EspelhoPonto from "@/interfaces/espelhoPonto";
import { espelhoPontoService } from "@/services/espelhoPontoService";

//Date services
import { format, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import ModalPDFViewer from "@/components/custom/PDFVizualizer/ModalPDFViewer";
import EspelhoPontoCard from "@/components/custom/espelhoPontoCard/espelhoPontoCard";

// Styles


export default function PointsHistoryPage() {
  // Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER");
  const [histPontos, setHistPontos] = useState<HistPonto[] | null>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null);
  const [espelhoPontos, setEspelhoPontos] = useState<EspelhoPonto[] | null>(null);
  const [selectedEspelhoPonto, setSelectedEspelhoPonto] = useState<EspelhoPonto | null>(null);
  const [pdfShowModal, setPdfShowModal] = useState(false);

  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  const getUser = async () => {
    const user = await getUsuario();
    return user.data;
  };
  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod) as Usuario;
      setUsuarioInfo(usuario_data);
      return {
        usuario_cod: usuario_data.usuario_cod,
        setorCod: usuario_data.setor.setorCod,
        nivelAcesso_cod: usuario_data.nivelAcesso.nivelAcesso_cod,
      };
    } catch (error) {
      console.log("Erro ao recuperar usuário de id " + usuario_cod);
      return null;
    }
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

    const fetchEspelhosPonto = async (usuario_cod: number) => {
      try {
        const espelhoPonto_data = await espelhoPontoService.getAllEspelhoPontoById(usuario_cod) as EspelhoPonto[];
        setEspelhoPontos(espelhoPonto_data);
      } catch (error) {
        console.log("Erro ao recuperar espelhoPonto de id de usuário " + usuario_cod);
      } finally {
        setIsLoading(false);
      }
    }

  useEffect(() => {
    const onMount = async () => {
      // Verifique se id está disponível antes de continuar
      if (!id)
        return;


      const usuario = await getUser();
      setUsuarioLogado(usuario);

      if (usuario.nivelAcesso.nivelAcesso_cod == 2) {
        fetchHistPontos(usuario.usuario_cod);
        setUsuarioInfo(usuario);
        return;
      }


      const usuarioId = await fetchUsuario(parseInt(id.toString()));
      if (!usuarioId)
        return;

      if (
        (usuarioId.setorCod != usuario.setor.setorCod && usuario.nivelAcesso.nivelAcesso_cod != 0) ||
        (usuarioId.nivelAcesso_cod < usuario.nivelAcesso.nivelAcesso_cod)
      )
        return;
      await fetchEspelhosPonto(usuarioId.usuario_cod);
      setAccessLevel("ADM");
      fetchHistPontos(parseInt(id.toString()));
    };

    onMount();
    // if (id)
    //   setIsLoading(false); // Set loading to false after data is fetched
  }, [id]); // Empty dependency array ensures the effect runs once after mount



  if (!usuarioLogado || !usuarioInfo)
    return;

  if (
    (usuarioInfo.setor.setorCod != usuarioLogado.setor.setorCod && usuarioLogado.nivelAcesso.nivelAcesso_cod != 0) ||
    (usuarioInfo.nivelAcesso.nivelAcesso_cod < usuarioLogado.nivelAcesso.nivelAcesso_cod)
  )
    return;




  const handleEdit = (entry: HistPonto) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };







  const SkeletonRow = () => (
    <div className="flex flex-row gap-7 mt-10 justify-between">
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-72 h-10" />
      <Skeleton className="bg-gray-200 w-48 h-10" />
      <Skeleton className="bg-gray-200 w-32 h-10" />
    </div>
  );
  return (
    isLoading ? (
      <div className="p-6 md:p-9">
        <Skeleton className=" bg-gray-200 h-10 w-48" />
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          <div className="flex flex-row gap-6 justify-between">
            <Skeleton className="bg-gray-200 w-80 h-10" />
            <Skeleton className="bg-gray-200 w-96 h-10" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}
        </div>
        <div className="flex w-full justify-end mt-10">
          <Skeleton className="bg-gray-200 h-40 w-[40rem]" />
        </div>
      </div>
    ) : (
      <div className="flex flex-col p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Meus Pontos" : `Informações de ${usuarioInfo?.usuario_nome}`}
        </h1>
        {accessLevel === "ADM" && usuarioInfo != null ?
          <EditarFuncionarioForm
            usuarioInfo={usuarioInfo}
            logadoInfo={
              {
                usuario_cod: usuarioLogado.usuario_cod,
                setorCod: usuarioLogado.setor.setorCod,
                nivelAcesso_cod: usuarioLogado.nivelAcesso.nivelAcesso_cod,
              }
            }

          /> : null}
        {accessLevel === "ADM" ? <h2 className="text-lg md:text-2xl font-semibold mb-4">Histórico de pontos</h2> : null}
        <PointsHistoryTable
          entries={histPontos}
          userInfo={usuarioInfo}
          onEdit={handleEdit}
          accessLevel={accessLevel}
        />
        <div className="flex w-full justify-end mt-10">
          {(usuarioLogado?.nivelAcesso.nivelAcesso_cod == 0 || (usuarioLogado?.nivelAcesso.nivelAcesso_cod == 1 && parseInt(id!.toString()) != usuarioLogado?.usuario_cod)) &&
            <CardBancoHoras usuarioCod={parseInt(id!.toString())} />
          }
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
                isUser={false}
              />
              )}

      </div>
    )
  );
}
