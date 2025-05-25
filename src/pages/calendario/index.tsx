import { useEffect, useState } from "react";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Services
import { getUsuario } from "@/services/authService";

// Components
import { Button } from "@/components/ui/button";
import ModalDefinirFeriado from "@/components/custom/ModaisCalendario/ModalDefinirFeriado";
import { EmpresaAPI } from "@/interfaces/empresa";
import { empresaServices } from "@/services/empresaService";
import { CardCalendario } from "./components/CardCalendario";
import { feriadoServices } from "@/services/feriadoService";
import { Feriado } from "@/interfaces/feriado";
import { faltaServices } from "@/services/faltaService";
import { CardResumoMensal } from "./components/ResumoMensal";
import { CardLegenda } from "./components/CardLegenda";
import Tab from "@/components/custom/tab";
import { folgaService } from "@/services/folgaService";
import Faltas from "@/interfaces/faltas";
import Folgas from "@/interfaces/folga";

interface DadosMes {
    ferias?: Folgas[]; 
    faltas?: Faltas[];
    folgas?: Folgas[];
}

export default function Calendario() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [empresa, setEmpresa] = useState<EmpresaAPI | null>(null);
    const [acessoCod, setAcessoCod] = useState<number | null>(null);

    const [activeTab, setActiveTab] = useState<"SETOR" | "MEUS DADOS">("SETOR");
    const [cardMensalAcesso, setCardMensalAcesso] = useState<'adm' | 'func' | 'jornada' | null>(null);
    const [currentDate, setCurrentDate] = useState(new Date());

    const [feriados, setFeriados] = useState<Feriado[] | null>(null);
    const [dadosMes, setDadosMes] = useState<DadosMes | null>(null);

    const [loading, setLoading] = useState(true);

    const [showModalDefinirFeriado, setShowModalDefinirFeriado] = useState(false);

    const formatDateToYYYYMMDD = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchDadosMes = async (data: string) => {
        if (!empresa) return;
        
        try {
            setLoading(true);
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
            setLoading(false);
        }
    };

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;
            setUsuario(usuario);
            setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
            if(acessoCod === 2){
                setCardMensalAcesso("func")
            }else{
                setCardMensalAcesso("adm")
            }

        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

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
            setLoading(false);
        } catch (error) {
            setFeriados(null);
            console.error("Error fetching user data", error);
        }
    };

    useEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        if(usuario?.empCod){
            fetchEmpresa(usuario!.empCod);
        }
    }, [usuario])

    useEffect(() => {
        if(empresa){
            fetchFeriados(empresa.empCod);
        }
    }, [empresa])

    useEffect(() => {
        if((acessoCod === 2 || acessoCod === 1 && activeTab === 'MEUS DADOS') && usuario){
            setCardMensalAcesso('func')
        } else if(acessoCod === 0 || (acessoCod === 1 && activeTab === 'SETOR')) {
            setCardMensalAcesso('adm')
        }
    }, [acessoCod, usuario, activeTab])

    useEffect(() => {
        if (empresa) {
            const dataFormatada = formatDateToYYYYMMDD(currentDate);
            fetchDadosMes(dataFormatada);
        }
    }, [empresa, currentDate]);

    const handleChangeTab = (status: string) => {
        setActiveTab(status ==  'SETOR' ? "SETOR" : "MEUS DADOS")
    }

    return(
        loading ? (
            <></>
        ) : (
            <>
            <div className="flex w-full justify-start items-center mb-4">
                <h1 className="text-xl md:text-3xl font-semibold">
                    {acessoCod === 0 ? 'Calendário da Empresa' : 'Meu Calendário'}
                </h1>
            </div>

            <div className="flex w-full flex-col justify-center gap-3">
                <div className="flex w-full justify-between items-center">
                    {acessoCod === 0 &&
                        <Button
                            variant='warning'
                            onClick={() => setShowModalDefinirFeriado(true)}
                            size='sm'
                        >
                            Definir Feriados
                        </Button>
                    }
                    {acessoCod === 1 &&          
                        <Tab
                            activeTab={activeTab}
                            onClick={handleChangeTab}
                            tabLabels={['SETOR', 'MEUS DADOS']} 
                            showBadge={false}  
                        />
                    }
                </div>
                <div className="flex w-full items-center md:gap-16 gap-8 flex-wrap">
                    <div className="flex flex-[2]">
                        <CardCalendario 
                            funcCalendar={cardMensalAcesso == 'func'} 
                            empCod={usuario!.empCod} 
                            usuarioCod={usuario!.usuario_cod}
                            feriados={feriados!}
                            setCurrentDate={setCurrentDate}
                            currentDate={currentDate}
                            dadosMes={dadosMes}
                        />
                    </div>
                    <div className="flex flex-[1] md:flex-col md:gap-16 gap-8 h-full md:justify-start justify-end flex-col-reverse">
                        <CardResumoMensal
                            acesso={cardMensalAcesso!} 
                            usuarioCod={usuario?.usuario_cod!} 
                            feriados={feriados!} 
                            dataCalendario={currentDate} 
                            dadosMes={dadosMes} 
                        />
                        <CardLegenda />
                    </div>
                </div>
            </div>

            {showModalDefinirFeriado &&
                <ModalDefinirFeriado 
                    empresa={empresa!}
                    onClose={() => setShowModalDefinirFeriado(false)}
                    onClick={() => setShowModalDefinirFeriado(false)}
                />
            }
            </>
        )
    )
}
