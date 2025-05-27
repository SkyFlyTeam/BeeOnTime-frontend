import { DataTable } from "@/components/ui/datatable";
import { columnsAdmin, columnsFunc } from "./columns";
import { bancoHorasMensalAdmin, bancoHorasMensalFunc } from "@/interfaces/bancoHoras";
import { useEffect, useLayoutEffect, useState } from "react";
import { relatorioBancoHorasServices } from "@/services/relatorioBancoHoras";
import { Skeleton } from "@/components/ui/skeleton";

import { getUsuario } from "@/services/authService";
import { Usuario } from "@/interfaces/usuario";
import Tab from "@/components/custom/tab";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import { setorServices } from "@/services/setorService";

type BancoHorasData = bancoHorasMensalAdmin[] | bancoHorasMensalFunc[];

export default function BancoHoras() {
    const router = useRouter();
    
    const [bancoHorasMensal, setBancoHorasMensal] = useState<BancoHorasData | null>(null)
    const [loading, setLoading] = useState(true);
    const currentData = new Date();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [acessoCod, setAcessoCod] = useState<number | null>(null);

    const [activeTab, setActiveTab] = useState<"SETOR" | "MEUS DADOS">("SETOR");

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;
            setUsuario(usuario);
            setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    // Buscar relatório de banco de horas de todos os usuário de um mês
    const fetchBancoHorasMensais = async (date: String) => {
        try{
            const data = await relatorioBancoHorasServices.getRelatorioMensalAdmin(date);
            const bancoHorasFiltrado = (data as bancoHorasMensalAdmin[]).filter(banco => 
                banco.usuarioCod !== usuario?.usuario_cod
            );
            setBancoHorasMensal(bancoHorasFiltrado);
            setLoading(false);
        }catch (err) {
           console.error("Erro ao carregar o relatório de banco de horas mensais.");
        }
    }

    // Buscar relatório de banco de horas mensal de um usuário (periodo de 6 meses)
    const fetchBancoHoras6Meses = async (date: String, usuario: Usuario) => {
        try{
            const data = await relatorioBancoHorasServices.getRelatorio6MesesFunc(date, usuario);
            setBancoHorasMensal(data as bancoHorasMensalFunc[]);
            setLoading(false);
        }catch (err) {
           console.error("Erro ao carregar o relatório de banco de horas mensais.");
        }
    }

    // Usuarios de um setor
    const fetchSetorUsuarios = async (setorCod: number) => {
        try{
            const data = await setorServices.getSetorUsuarios(setorCod);
            let usuarios = data as Usuario[]; 

            // Filtrando os registros para ter usuários do respectivo setor apenas
            const usuarioCods = usuarios.map(usuario => usuario.usuario_cod);
            const bancoHorasFiltrado = bancoHorasMensal!.filter(banco => 
                usuarioCods.includes(banco.usuarioCod)
            );   
            
            setBancoHorasMensal(bancoHorasFiltrado as bancoHorasMensalFunc[]);
        }catch (err) {
           console.error("Erro ao carregar o relatório de banco de horas mensais.");
        }
    }

    useEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        // Converte para o formato YYYY-MM-DD
        const dataFormatada = currentData.toISOString().split('T')[0];

        if((acessoCod === 2 || acessoCod === 1 && activeTab === 'MEUS DADOS') && usuario){
            fetchBancoHoras6Meses(dataFormatada, usuario)
        } else if(acessoCod === 0 || (acessoCod === 1 && activeTab === 'SETOR')) {
            fetchBancoHorasMensais(dataFormatada);
        }
    }, [acessoCod, usuario, activeTab])

    useEffect(() => {
        if(acessoCod === 1 && activeTab === 'SETOR'){
            fetchSetorUsuarios(usuario?.setor.setorCod!);
        }
    }, [bancoHorasMensal, usuario])

    const handleChangeTab = (status: string) => {
        setActiveTab(status ==  'SETOR' ? "SETOR" : "MEUS DADOS")
    }


        const adjustedColumnsAdmin = columnsAdmin.map((column) => {
            if (column.id === "Ações") {
              column.cell = ({ row }) => {
                const id = row.getValue("usuarioCod"); 
                const data = row.getValue("dataMes"); 
                
                return (
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => router.push(`/bancoHoras/${id}?data=${data}`)}>
                      <FontAwesomeIcon icon={faEye} className="text-black-600" />
                    </Button>
                  </div>
                );
              };
            }
            return column;
        });
        const adjustedColumnsFunc = columnsFunc.map((column) => {
            if (column.id === "Ações") {
              column.cell = ({ row }) => {
                const id = usuario?.usuario_cod; 
                const data = row.getValue("mesAno"); 
                
                return (
                  <div className="flex space-x-2 justify-center">
                    <Button onClick={() => router.push(`/bancoHoras/${id}?data=${data}`)}>
                      <FontAwesomeIcon icon={faEye} className="text-black-600" />
                    </Button>
                  </div>
                );
              };
            }
            return column;
        });

    
    
    useLayoutEffect(() => {
        if (!loading) {
            const descontoCells = document.getElementsByClassName('desconto');
    
            [...descontoCells].forEach((cell, index) => {
                const divCell = cell as HTMLElement;
    
                const parent = divCell.parentElement;
    
                if (parent) {
                    if (index % 2 === 0) {
                        parent.style.backgroundColor = '#FFE19C'; 
                    } else {
                        parent.style.backgroundColor = '#FFDA82';  
                    }
    
                    parent?.parentElement?.addEventListener('mouseenter', () => {
                        if (parent.tagName !== 'TH') {
                            parent.style.backgroundColor = '#FED7AA';  
                        }
                    });
    
                    parent?.parentElement?.addEventListener('mouseleave', () => {
                        // Restaura a cor original
                        if (index % 2 === 0) {
                            parent.style.backgroundColor = '#FFE19C';
                        } else {
                            parent.style.backgroundColor = '#FFDA82';
                        }
                    });
                }
            });
        }
    }, [bancoHorasMensal]);

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

    return(
        loading ? (
            <div className="flex flex-col  p-6 md:p-9">
                <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">

                    <div className="flex flex-row justify-between">
                    <Skeleton className="bg-gray-200 w-80 h-10" />
                    <Skeleton className="bg-gray-200 w-96 h-10" />
                    </div>
                    {[...Array(5)].map((_, idx) => (
                    <SkeletonRow key={idx} />
                    ))}
                </div>
            </div>
        ) : (
            <>  
                <div className="flex w-full justify-between items-center mb-4">
                    <h1 className="text-xl md:text-3xl font-semibold ">Banco de Horas</h1>
                    {acessoCod === 1 &&          
                        <Tab
                            activeTab={activeTab}
                            onClick={handleChangeTab}
                            tabLabels={['SETOR', 'MEUS DADOS']} 
                            showBadge={false}  
                        />
                    }
                </div>
               
                <div className="min-w-fit bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-4 rounded-xl p-6">
                    {acessoCod === 0 || (acessoCod === 1 && activeTab === 'SETOR') ? (
                        <DataTable 
                            columns={adjustedColumnsAdmin} 
                            data={bancoHorasMensal as bancoHorasMensalAdmin[]} 
                            filterColumns={["usuarioNome"]} 
                            title={`Mês de ${currentData.toLocaleString('pt-BR', { month: 'long' })}`}
                        />
                    ) : (
                        <DataTable 
                            columns={adjustedColumnsFunc} 
                            data={bancoHorasMensal as bancoHorasMensalFunc[]} 
                            showSearchBar={false}
                            filterColumns={[]} 
                            title={`Mês de ${currentData.toLocaleString('pt-BR', { month: 'long' })}`}
                        />
                    )}
                    <span className="flex gap-1 w-full text-sm"><span className="text-red-500">*</span>Os valores informados estão sujeitos a alterações durante o mês</span>
                </div>
            </>
        )
    )
}