import { getUsuario } from "@/services/authService";
// componentes
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import TabelaFalhas from "@/components/custom/TabelaFalhas";
// componentes react
import { useEffect, useRef, useState } from "react";
// services
import { atrasoServices } from "@/services/atrasoService";
// icones
import { BiCalendar } from "react-icons/bi";
// styles
import styles from './style.module.css';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
// interfaces
import { Usuario } from "@/interfaces/usuario";
import Atraso from "@/interfaces/atraso";

export default function FalhasMarcacoes() {
    const [usuario, setUsuario] = useState<Usuario>();
    const [atrasos, setAtrasos] = useState<Atraso[]>([]);
    const [atrasosFiltrados, setAtrasosFiltrados] = useState<Atraso[]>([]);
    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);  // Página atual
    const itemsPerPage = 5;

    const dataInicioRef = useRef<HTMLInputElement>(null);
    const dataFimRef = useRef<HTMLInputElement>(null);

    const abrirCalendarioInicio = () => {
        if (dataInicioRef.current) {
            dataInicioRef.current.showPicker(); 
        }
    };

    const abrirCalendarioFim = () => {
        if (dataFimRef.current) {
            dataFimRef.current.showPicker(); 
        }
    };

    const getUser = async () => {
        const user = await getUsuario();
        return user.data;
    }

    // Filtro de dados com base nas datas
    const filterData = () => {
        if(!dataFim && !dataInicio){
            setAtrasosFiltrados(atrasos)
        }
        let filteredAtrasos = atrasos;

        if (dataInicio && dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataAtraso >= inicio && dataAtraso <= fim;
            });
        } else if (dataInicio && !dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData);
                const inicio = new Date(dataInicio);
                return dataAtraso >= inicio;
            });
        } else if (!dataInicio && dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData);
                const fim = new Date(dataFim);
                return dataAtraso <= fim;
            });
        }

        setAtrasosFiltrados(filteredAtrasos);
    };

    // Função para buscar os atrasos
    const fetchAtrasos = async () => {
        try {
            const usuarioLogado = await getUser();
            setUsuario(usuarioLogado);

            if (usuarioLogado) {
                let pontos;
                if (usuarioLogado.nivelAcesso.nivelAcesso_cod === 0) {
                    pontos = await atrasoServices.getPontos();
                } else {
                    pontos = await atrasoServices.getPontosBySetor(usuarioLogado.setor.setorCod);
                }

                setAtrasos(pontos);
                setAtrasosFiltrados(pontos);
            }
        } catch (err) {
            setError("Erro ao carregar os usuários.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAtrasos();
    }, []);

    useEffect(() => {
        filterData();  
    }, [dataInicio, dataFim, atrasos]);  // Chamando a função filterData quando os filtros ou os dados mudam.

    // Função de Paginação
    const paginate = (items: Atraso[], currentPage: number, itemsPerPage: number) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return items.slice(startIndex, endIndex);
    };

    // Atualiza os itens exibidos de acordo com a página atual
    const paginatedData = paginate(atrasosFiltrados, currentPage, itemsPerPage);

    const SkeletonRow = () => (
        <div className="flex flex-row gap-7 mt-10">
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-72 h-10" />
            <Skeleton className="bg-gray-200 w-48 h-10" />
            <Skeleton className="bg-gray-200 w-32 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
        </div>
    );

    if (loading) {
        return (
            <div>
                <div className="flex flex-row gap-7">
                    <Skeleton className="bg-gray-200 w-24 h-10" />
                    <Skeleton className="bg-gray-200 w-24 h-10" />
                    <Skeleton className="bg-gray-200 w-24 h-10" />
                    <Skeleton className="bg-gray-200 w-72 h-10" />
                    <Skeleton className="bg-gray-200 w-48 h-10" />
                    <Skeleton className="bg-gray-200 w-32 h-10" />
                    <Skeleton className="bg-gray-200 w-24 h-10" />
                </div>
                {[...Array(5)].map((_, idx) => (
                    <SkeletonRow key={idx} />
                ))}
            </div>
        );
    }

    return (
        <div>
            <div className="container mx-auto px-4 flex justify-between">
                <h1 className="text-3xl font-bold text-left">Falhas em Marcações</h1>
            </div>

            {atrasosFiltrados && (
                <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-5">
                    <div className="container mx-auto flex justify-between items-center mb-4">
                        <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                            <div className="flex items-center space-x-2">
                                <Label className={styles.dateLabel}>De</Label>
                                <BiCalendar className="text-500 cursor-pointer" onClick={abrirCalendarioInicio} />
                                <input
                                    type="date"
                                    value={dataInicio}
                                    onChange={(e) => setDataInicio(e.target.value)}
                                    className={`${styles.dateInput}`}
                                    ref={dataInicioRef}
                                />
                            </div>

                            <div className="flex items-center space-x-2">
                                <Label className={styles.dateLabel}>Até</Label>
                                <BiCalendar className="text-500 cursor-pointer" onClick={abrirCalendarioFim} />
                                <input
                                    type="date"
                                    value={dataFim}
                                    onChange={(e) => setDataFim(e.target.value)}
                                    className={`${styles.dateInput}`}
                                    ref={dataFimRef}
                                />
                            </div>
                        </div>
                    </div>
                    <TabelaFalhas atrasos={paginatedData} />
                    <div className="container mx-auto flex justify-end w-full mt-4">
                        <Pagination className="w-full flex justify-end">
                            <PaginationPrevious 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                className={currentPage === 1 ? "cursor-not-allowed" : ""} 
                            />
                            <PaginationContent>
                                {Array.from({ length: Math.ceil(atrasosFiltrados.length / itemsPerPage) }, (_, idx) => (
                                    <PaginationItem key={idx}>
                                        <PaginationLink
                                            isActive={currentPage === idx + 1}
                                            onClick={() => setCurrentPage(idx + 1)}
                                        >
                                            {idx + 1}
                                        </PaginationLink>
                                    </PaginationItem>
                                ))}
                            </PaginationContent>
                            <PaginationNext 
                                onClick={() => setCurrentPage(prev => prev + 1)}
                                className={currentPage === Math.ceil(atrasosFiltrados.length / itemsPerPage) ? "cursor-not-allowed" : ""} 
                            />
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    );
}
