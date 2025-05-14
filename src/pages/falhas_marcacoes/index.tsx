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
import GraficoFalhas from "@/components/custom/GraficoFalhas";
import { HorasDTO } from "@/interfaces/horas";
import { horasServices } from "@/services/horasServices";
import { ApiException } from "@/config/apiExceptions";
import { pontoServices } from "@/services/pontoServices";
import HistPonto, { Ponto } from "@/interfaces/histPonto";
import { solicitacaoServices } from "@/services/solicitacaoServices";
import SolicitacaoInterface from "@/interfaces/Solicitacao";

export default function FalhasMarcacoes() {
    const [usuario, setUsuario] = useState<Usuario>();
    const [atrasos, setAtrasos] = useState<Atraso[]>([]);
    const [atrasosFiltrados, setAtrasosFiltrados] = useState<Atraso[]>([]);

    const [pontuais, setPontuais] = useState<HorasDTO[]>([])
    const [pontuaisFiltrados, setPontuaisFiltrados] = useState<HorasDTO[]>([])

    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");

    const [marcacoesCorretas, setMarcacoesCorretas] = useState<HistPonto[]>([])
    const [marcacoesCorretasFiltrados, setMarcacoesCorretasFiltrados] = useState<HistPonto[]>([])

    const [solicitacoesAjustes, setSolicitacoesAjustes] = useState<SolicitacaoInterface[]>([])
    const [solicitacoesAjustesFiltrados, setSolicitacoesAjustesFiltrados] = useState<SolicitacaoInterface[]>([])

    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>("");
    const [currentPage, setCurrentPage] = useState(1);  // Página atual
    const itemsPerPage = 5;

    const dataInicioRef = useRef<HTMLInputElement>(null);
    const dataFimRef = useRef<HTMLInputElement>(null);

    const [today, setToday] = useState("")

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
            setPontuaisFiltrados(pontuais)
            setMarcacoesCorretasFiltrados(marcacoesCorretas)
            setSolicitacoesAjustesFiltrados(solicitacoesAjustes)
        }
        let filteredAtrasos = atrasos
        let filteredPontuais = pontuais
        let filteredMarcacoes = marcacoesCorretas
        let filteredSolicitacoes = solicitacoesAjustes

        if (dataInicio && dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataAtraso >= inicio && dataAtraso <= fim;
            })
            filteredPontuais = pontuais.filter((ponto) => {
                const dataPonto = new Date(ponto.horasData);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return dataPonto >= inicio && dataPonto <= fim;
            })
            filteredMarcacoes = marcacoesCorretas.filter((marcacao) => {
                const datamarcacao = new Date(marcacao.data);
                const inicio = new Date(dataInicio);
                const fim = new Date(dataFim);
                return datamarcacao >= inicio && datamarcacao <= fim;
            })
            filteredSolicitacoes = solicitacoesAjustes.filter((solicitacao) => {
                const solicitacaoData = new Date(solicitacao.solicitacaoDataPeriodo)
                const inicio = new Date(dataInicio)
                const fim = new Date(dataFim)
                return solicitacaoData >= inicio && solicitacaoData <= fim
            })

        } else if (dataInicio && !dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData)
                const inicio = new Date(dataInicio)
                return dataAtraso >= inicio
            })
            filteredPontuais = pontuais.filter((ponto) => {
                const dataPonto = new Date(ponto.horasData)
                const inicio = new Date(dataInicio)
                return dataPonto >= inicio 
            })
             filteredMarcacoes = marcacoesCorretas.filter((marcacao) => {
                const datamarcacao = new Date(marcacao.data)
                const inicio = new Date(dataInicio)
                return datamarcacao >= inicio 
            })
            filteredSolicitacoes = solicitacoesAjustes.filter((solicitacao) => {
                const solicitacaoData = new Date(solicitacao.solicitacaoDataPeriodo);
                const inicio = new Date(dataInicio);
                return solicitacaoData >= inicio 
            })

        } else if (!dataInicio && dataFim) {
            filteredAtrasos = atrasos.filter((atraso) => {
                const dataAtraso = new Date(atraso.horas.horasData);
                const fim = new Date(dataFim)
                return dataAtraso <= fim
            })
            filteredPontuais = pontuais.filter((ponto) => {
                const dataPonto = new Date(ponto.horasData);
                const fim = new Date(dataFim)
                return dataPonto <= fim
            })
             filteredMarcacoes = marcacoesCorretas.filter((marcacao) => {
                const datamarcacao = new Date(marcacao.data)
                const fim = new Date(dataFim)
                return datamarcacao <= fim
            })
            filteredSolicitacoes = solicitacoesAjustes.filter((solicitacao) => {
                const solicitacaoData = new Date(solicitacao.solicitacaoDataPeriodo)
                const fim = new Date(dataFim)
                return solicitacaoData <= fim
            })
        }

        setAtrasosFiltrados(filteredAtrasos)
        setPontuaisFiltrados(filteredPontuais)
        setMarcacoesCorretasFiltrados(filteredMarcacoes)
        setSolicitacoesAjustesFiltrados(filteredSolicitacoes)
    };

    // Função para buscar os atrasos
    const fetchAtrasos = async () => {
        try {
            const usuarioLogado = await getUser();
            setUsuario(usuarioLogado);

            if (usuarioLogado) {
                let pontosFounded;
                if (usuarioLogado.nivelAcesso.nivelAcesso_cod === 0) {
                    pontosFounded = await atrasoServices.getPontos();
                } else {
                    pontosFounded = await atrasoServices.getPontosBySetor(usuarioLogado.setor.setorCod);
                }

                setAtrasos(pontosFounded);
                setAtrasosFiltrados(pontosFounded);
            }
        } catch (err) {
            setError("Erro ao carregar os atrasos.");
        } finally {
            setLoading(false);
        }
    };

    const fetchPontuais = async () => {
        try {
            const pontosFounded = await horasServices.getPontuais()

            if (pontosFounded instanceof ApiException) {
                setError(pontosFounded.message);
            } else {
                setPontuais(pontosFounded);
                setPontuaisFiltrados(pontosFounded)
            }

        } catch (err) {
            setError("Erro ao carregar os pontos pontuais.");
        } 
    }

    const fetchPontos = async () => {
        try {
            const pontosFounded = await pontoServices.getAll()
            if(pontosFounded instanceof ApiException) {
                setError(pontosFounded.message)
            } else {
                const pontosSemAjuste = pontosFounded.filter(ponto => 
                    !solicitacoesAjustes.some(sol =>
                        sol.tipoSolicitacaoCod.tipoSolicitacaoCod === 1 &&
                        sol.solicitacaoDataPeriodo === ponto.data &&
                        sol.usuarioCod === ponto.usuarioCod
                    )
                    )
                setMarcacoesCorretas(pontosFounded)
                setMarcacoesCorretasFiltrados(pontosFounded)
            }
        } catch (err) {
            setError("Erro ao carregar os pontos.");
        } 
    }

    const fetchSolicitacoes = async () => {
        try {
            const solicitacoes = await solicitacaoServices.getAllSolicitacao()
            if(!(solicitacoes instanceof ApiException)){
                const solicitacoesFilteres = solicitacoes.filter((solicitacao: SolicitacaoInterface) => {
                    solicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod === 1;
                })
                setSolicitacoesAjustes(solicitacoesFilteres)
                setSolicitacoesAjustesFiltrados(solicitacoesFilteres)
            }
        } catch (err) {
            setError("Erro ao carregar solicitações.");
        } 
    }

    useEffect(() => {
        fetchAtrasos()
        fetchPontuais()
        fetchSolicitacoes()
        fetchPontos()
        const currentDate = new Date().toISOString().split("T")[0]
        setToday(currentDate)
    }, []);

    useEffect(() => {
        filterData();  
    }, [dataInicio, dataFim, atrasos, pontuais, marcacoesCorretas, solicitacoesAjustes])

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

    const showTabela = atrasosFiltrados.length > 0
    const showGraficos = atrasosFiltrados.length > 0 || pontuaisFiltrados.length > 0 || solicitacoesAjustesFiltrados.length > 0 || marcacoesCorretasFiltrados.length > 0

    return (
        <div>
            <div className="container mx-auto px-4 flex justify-between">
                <h1 className="text-3xl font-bold text-left">Falhas em Marcações</h1>
            </div>

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
                                max={dataFim ? dataFim : today}
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
                                min={dataInicio ? dataInicio : undefined}
                                max={today}
                            />
                        </div>
                    </div>
                </div>

                {showTabela &&  (
                    <>
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
                    </>
                )}

                {showGraficos && !showTabela && (
                    <GraficoFalhas 
                        atrasos={atrasosFiltrados.length} 
                        pontuais={pontuaisFiltrados.length} 
                        solicitacoesAjustes={solicitacoesAjustesFiltrados.length} 
                        marcacoesCorretas={marcacoesCorretasFiltrados.length}               
                    />
                )}

                {!showTabela && !showGraficos && (
                    <div className="container mx-auto px-4 py-10 flex flex-col items-center max-w-8xl">
                        <img 
                            src="/images/sem_conteudo.svg" 
                            alt="No data" 
                            className="w-90 h-90 object-contain"  
                        />
                        <p className="text-md font-semibold mt-4">Ops! Parece que não tem nada aqui!</p>
                    </div>
                )}
            </div>

            {showGraficos && showTabela && (
                <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-5">
                    <GraficoFalhas 
                        atrasos={atrasosFiltrados.length} 
                        pontuais={pontuaisFiltrados.length} 
                        solicitacoesAjustes={solicitacoesAjustesFiltrados.length} 
                        marcacoesCorretas={marcacoesCorretasFiltrados.length}               
                    />
                </div>
            )}
        </div>
    )
}