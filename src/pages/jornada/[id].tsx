"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";

// Services
import { usuarioServices } from "@/services/usuarioServices";
import { getRoleID, getUsuario } from "@/services/authService";

// Interfaces;
import { Usuario } from "@/interfaces/usuario";

// Components
import { Skeleton } from "@/components/ui/skeleton";
import EditarJornadaForm from "@/components/custom/CardEditarJornada/editarJornadaForm";
import { useRouter } from "next/router";
import { CardCalendario } from "../calendario/components/CardCalendario";
import { CardResumoMensal } from "../calendario/components/ResumoMensal";
import { CardLegenda } from "../calendario/components/CardLegenda";
import { EmpresaAPI } from "@/interfaces/empresa";
import { Feriado } from "@/interfaces/feriado";
import { DadosMes } from "../calendario";
import Faltas from "@/interfaces/faltas";
import Folgas from "@/interfaces/folga";
import { empresaServices } from "@/services/empresaService";
import { faltaServices } from "@/services/faltaService";
import { feriadoServices } from "@/services/feriadoService";
import { folgaService } from "@/services/folgaService";


export default function JornadaPage() {
  //Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER")
  const [isLoading, setIsLoading] = useState(true); //Estado controle de carregamento
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>();
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>();
	const [empresa, setEmpresa] = useState<EmpresaAPI | null>(null);
	const [acessoCod, setAcessoCod] = useState<number | null>(null);

	const [cardMensalAcesso, setCardMensalAcesso] = useState<'adm' | 'func' | 'jornada' | null>('jornada');
	const [currentDate, setCurrentDate] = useState(new Date());

	const [feriados, setFeriados] = useState<Feriado[] | null>(null);
	const [dadosMes, setDadosMes] = useState<DadosMes | null>(null);

	const [showModalDefinirFeriado, setShowModalDefinirFeriado] = useState(false);

  const router = useRouter();
  const { id } = router.query;

  const getUser = async () => {
    const user = await getUsuario();
    return user.data;
  };
  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod) as Usuario;
      //alert(JSON.stringify(usuario_data))
      setUsuarioInfo(usuario_data);
			setAcessoCod(usuario_data.usuario_cod);
      return {
        usuario_cod: usuario_data.usuario_cod,
        setorCod: usuario_data.setor.setorCod,
        nivelAcesso_cod: usuario_data.nivelAcesso.nivelAcesso_cod,
      };
    } catch (error) {
      console.error("Erro ao recuperar usuário de id " + usuario_cod);
      return null;
    }
  };

  // Utilize useEffect para chamar a função quando o componente for montado
  useEffect(() => {
    const onMount = async () => {
      // Verifique se id está disponível antes de continuar
      if (!id)
        return;


      const usuario = await getUser();
      setUsuarioLogado(usuario);


      if (usuario.nivelAcesso.nivelAcesso_cod == 2) {
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

      setAccessLevel("ADM");
    };

    onMount();
  }, [id]); // Empty dependency array ensures the effect runs once after mount

	const fetchEmpresa = async (empCod: number) => {
			try {
					const empresa_data = await empresaServices.verificarEmpresaById(empCod);
					setEmpresa(empresa_data);
			} catch (error) {
					console.error("Error fetching user data", error);
			}
	};

	const fetchFeriados = async (empCod: number) => {
			try {
					const feriado_data = await feriadoServices.getAllFeriadoByEmpresa(empCod);
					setFeriados(feriado_data);
					setIsLoading(false);
			} catch (error) {
					setFeriados(null);
					console.error("Error fetching user data", error);
			}
	};

	const formatDateToYYYYMMDD = (date: Date): string => {
			const year = date.getFullYear();
			const month = (date.getMonth() + 1).toString().padStart(2, '0');
			const day = date.getDate().toString().padStart(2, '0');
			return `${year}-${month}-${day}`;
	};

	const fetchDadosMes = async (data: string) => {
			if (!empresa) return;
			
			try {
					setIsLoading(true);
					const [folgas_data, faltas_data] = await Promise.all([
							folgaService.getFolgaMonthByEmpresa(empresa.empCod, data),
							faltaServices.getFaltasMonthByEmpresa(empresa.empCod, data)
					]);

					let ferias = (folgas_data as Folgas[]).filter((folga) => folga.folgaTipo.tipoFolgaCod == 2)
					let folgas = (folgas_data as Folgas[]).filter((folga) => folga.folgaTipo.tipoFolgaCod == 1)

					setDadosMes({
							folgas: folgas,
							faltas: faltas_data as Faltas[],
							ferias: ferias
					});
			} catch (error) {
					console.error("Erro ao buscar dados do mês:", error);
					setDadosMes(null);
			} finally {
					setIsLoading(false);
			}
	};

	useEffect(() => {
        if(usuarioLogado?.empCod){
            fetchEmpresa(usuarioLogado!.empCod);
        }
    }, [usuarioLogado])

    useEffect(() => {
        if(empresa){
            fetchFeriados(empresa.empCod);
        }
    }, [empresa])

    useEffect(() => {
        if (empresa) {
            const dataFormatada = formatDateToYYYYMMDD(currentDate);
            fetchDadosMes(dataFormatada);
        }
    }, [empresa, currentDate]);



  if (!usuarioLogado || !usuarioInfo)
    return;

  if (
    (usuarioInfo.setor.setorCod != usuarioLogado.setor.setorCod && usuarioLogado.nivelAcesso.nivelAcesso_cod != 0) ||
    (usuarioInfo.nivelAcesso.nivelAcesso_cod < usuarioLogado.nivelAcesso.nivelAcesso_cod) ||
    (usuarioInfo.usuario_cod == usuarioLogado.usuario_cod)
  )
    return;


  if (isLoading) {
    return (
      <div className="flex flex-col  p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho"}
        </h1>
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
          <div className="flex flex-row wrap justify-between">
            <Skeleton className="bg-gray-200 w-80 h-14" />
            <Skeleton className="bg-gray-200 w-32 h-14" />
            <Skeleton className="bg-gray-200 w-32 h-14" />
            <Skeleton className="bg-gray-200 w-32 h-14" />
            <Skeleton className="bg-gray-200 w-96 h-14" />
          </div>
        </div>
      </div>
    )
  }
  return (
    <>
      <div className="flex flex-col  p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho - " + usuarioInfo.usuario_nome}
        </h1>
        {accessLevel === "ADM" && usuarioInfo ?
          <EditarJornadaForm
            usuarioInfo={usuarioInfo}
            logadoInfo={
              {
                usuario_cod: usuarioLogado.usuario_cod,
                setorCod: usuarioLogado.setor.setorCod,
                nivelAcesso_cod: usuarioLogado.nivelAcesso.nivelAcesso_cod,
              }
            }

          /> : null}
		  <div className="flex w-full justify-start items-center mb-4">
                <h1 className="text-xl md:text-3xl font-semibold">
                    Calendário
                </h1>
            </div>
          <div className="flex w-full items-center md:gap-16 gap-8 flex-wrap">
            <div className="flex flex-[2]">
                <CardCalendario 
                    funcCalendar={cardMensalAcesso == 'jornada'} 
                    empCod={usuarioInfo!.empCod} 
                    usuarioCod={usuarioInfo!.usuario_cod}
                    feriados={feriados!}
                    setCurrentDate={setCurrentDate}
                    currentDate={currentDate}
                    dadosMes={dadosMes}
                    funcInfo={usuarioInfo}
                />
            </div>
            <div className="flex flex-[1] md:flex-col md:gap-16 gap-8 h-full md:justify-start justify-end flex-col-reverse">
                <CardResumoMensal
                    acesso={cardMensalAcesso!} 
                    usuarioCod={usuarioLogado?.usuario_cod!} 
                    feriados={feriados!} 
                    dataCalendario={currentDate} 
                    dadosMes={dadosMes} 
                    funcInfo={usuarioInfo}
                />
                <CardLegenda />
            </div>
        </div>
      </div>
    </>
  );
}