import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { BiCalendar } from "react-icons/bi";
import styles from './style.module.css'
import { useEffect, useRef, useState } from "react";
import GraficoAusencias from "@/components/custom/GraficoAusencias";
import { faltaServices } from "@/services/faltaService";
import { ApiException } from "@/config/apiExceptions";
import Faltas from "@/interfaces/faltas";
import { useMemo } from 'react';
import { solicitacaoServices } from "@/services/solicitacaoServices";
import SolicitacaoInterface from "@/interfaces/Solicitacao";
import { Usuario } from "@/interfaces/usuario";
import { usuarioServices } from "@/services/usuarioServices";
import TabelaAusencia from "@/components/custom/TabelaAusencia";
import TablePagination from "@/components/custom/TablePagination/TablePagination";
import { folgaService } from "@/services/folgaService";
import Folgas from "@/interfaces/folga";

export default function Ausencias() {
    const [folgas, setFolgas] = useState({
        folgas: [] as Folgas[],
        filtradas: [] as Folgas[]
    })
    const [licencasMedicas, setLicencasMedicas] = useState({
        licencasMedicas: [] as SolicitacaoInterface[],
        filtradas: [] as SolicitacaoInterface[]
    })
    const [ferias, setFerias] = useState({
        ferias: [] as Folgas[], 
        filtradas: [] as Folgas[]
    })
    const [ausenciasJustificadas, setAusenciasJustificadas] = useState({
        ausensiasJustificadas: [] as Faltas[],
        filtradas: [] as Faltas[]
    })
    const [ausenciasNaoJustificadas, setAusenciasNaoJustificadas] = useState({
        ausensiasNaoJustificadas: [] as Faltas[],
        filtradas: [] as Faltas[]
    })

    const [funcionarios, setFuncionarios] = useState<Usuario[]>([])
    // estrutura de dados para serem enviados para a tabela
    const [qtdAusencia, setQtdAusencias] = useState<Record<string, number>>()
    // ausência selecionada para filtro
    const [ausenciaSelecionada, setAusenciaSelecionada] = useState<string>("Ausências Totais");
    // componentes de referências para calendário
    const dataInicioRef = useRef<HTMLInputElement>(null)
    const dataFimRef = useRef<HTMLInputElement>(null)
    // valores das datas
    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [hoje, setHoje] = useState("")
    // paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;


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

    const fetchFaltas = async () => {
        try {
            const faltasFounded = await faltaServices.getAll()
            if (!(faltasFounded instanceof ApiException) && faltasFounded){
                const faltasJustificadas = faltasFounded.filter(falta => falta.faltaJustificativa != null)
                const faltasNaoJustificadas = faltasFounded.filter(falta => falta.faltaJustificativa == null)
                setAusenciasJustificadas({ausensiasJustificadas: faltasJustificadas, filtradas: faltasJustificadas})
                setAusenciasNaoJustificadas({ausensiasNaoJustificadas: faltasNaoJustificadas, filtradas: faltasNaoJustificadas})
            }
        } catch (err) {
            throw err
        }
    }

    const fetchSolicitacoes = async () => {
        try {
            const solicitacoesFounded = await solicitacaoServices.getSolicitacaoByTipo(6)
            if(!(solicitacoesFounded instanceof ApiException) && solicitacoesFounded){
                setLicencasMedicas({licencasMedicas: solicitacoesFounded, filtradas: solicitacoesFounded})
            }
        } catch (err) {
            throw err
        }
    }

    const fetchUsuarios = async () => {
        try {
            const funcionariosFounded = await usuarioServices.getAllUsuarios()
            if(!(funcionariosFounded instanceof ApiException) && funcionariosFounded) {
                setFuncionarios(funcionariosFounded)
            }
        } catch (err) {
            throw err
        }
    }

    const fetchFolgas = async () => {
        try {
            const folgasFounded = await folgaService.getAll()
            if(!(folgasFounded instanceof ApiException) && folgasFounded) {
                const folgaFiltrada = folgasFounded.filter((folga) => folga.folgaTipo.tipoFolgaCod === 1)
                const feriasFiltrada = folgasFounded.filter((folga) => folga.folgaTipo.tipoFolgaCod === 2)
                setFolgas({folgas: folgaFiltrada, filtradas: folgaFiltrada})
                setFerias({ferias: feriasFiltrada, filtradas: feriasFiltrada})
            }
            console.log(folgasFounded)
        } catch (error) {
            throw error
        }
    }

    const filterData = () => {
        if (!dataInicio && !dataFim) {
            setAusenciaSelecionada('Ausências Totais')
            quantidadeAusenciasFuncionario()
            return { 
                ausenciasJustificadas: ausenciasJustificadas.ausensiasJustificadas, 
                ausenciasNaoJustificadas: ausenciasNaoJustificadas.ausensiasNaoJustificadas, 
                licencasMedicas: licencasMedicas.licencasMedicas,
                ferias: ferias.ferias,
                folgas: folgas.folgas
            }
        }

        const dataInicioDate = dataInicio ? new Date(dataInicio) : null;
const dataFimDate = dataFim ? new Date(dataFim) : null;

const filterPeriodArray = (periodArray: (string | Date)[]) => {
    if (periodArray.length === 0) return false;

    const dates = periodArray.map(dateItem => (dateItem instanceof Date) ? dateItem : new Date(dateItem));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));

    console.log("Periodo minDate:", minDate);
    console.log("Periodo maxDate:", maxDate);
    console.log("Filtro dataInicio:", dataInicioDate);
    console.log("Filtro dataFim:", dataFimDate);

    const startsBeforeEnd = !dataFimDate || minDate <= dataFimDate;
    const endsAfterStart = !dataInicioDate || maxDate >= dataInicioDate;

    console.log("startsBeforeEnd:", startsBeforeEnd);
    console.log("endsAfterStart:", endsAfterStart);

    return startsBeforeEnd && endsAfterStart;
}


        return {
            ausenciasJustificadas: ausenciasJustificadas.ausensiasJustificadas.filter(falta => {
                const faltaDate = new Date(falta.faltaDia)
                return (!dataInicio || faltaDate >= new Date(dataInicio)) &&
                    (!dataFim || faltaDate <= new Date(dataFim))
            }),
            ausenciasNaoJustificadas: ausenciasNaoJustificadas.ausensiasNaoJustificadas.filter(falta => {
                const faltaDate = new Date(falta.faltaDia)
                return (!dataInicio || faltaDate >= new Date(dataInicio)) &&
                    (!dataFim || faltaDate <= new Date(dataFim))
            }),
            licencasMedicas: licencasMedicas.licencasMedicas.filter(solicitacao => {
                const solicitacaoDate = new Date(solicitacao.solicitacaoDataPeriodo)
                return (!dataInicio || solicitacaoDate >= new Date(dataInicio)) &&
                    (!dataFim || solicitacaoDate <= new Date(dataFim))
            }),
            folgas: folgas.folgas.filter(folga => filterPeriodArray(folga.folgaDataPeriodo)),
            ferias: ferias.ferias.filter(feria => filterPeriodArray(feria.folgaDataPeriodo))
        }
    }

    const quantidadeAusenciasFuncionario = () => {
        const ausenciaData: Record<string, number> = {}
        
        funcionarios.forEach((funcionario) => {
            switch (ausenciaSelecionada) {
                case 'Folga':
                    const totalFolgas = folgas.filtradas.filter(f => f.usuarioCod === funcionario.usuario_cod).length
                    if(totalFolgas == 0){
                        break
                    }
                    ausenciaData[funcionario.usuario_nome] = totalFolgas
                    break;
                case 'Férias':
                    const totalFerias = ferias.filtradas.filter(f => f.usuarioCod === funcionario.usuario_cod).length
                    if(totalFerias == 0) {
                        break
                    }
                    ausenciaData[funcionario.usuario_nome] = totalFerias
                    break;
                case 'Licença médica':
                    const totalLicenca = licencasMedicas.filtradas.filter(l => l.usuarioCod === funcionario.usuario_cod).length
                    if (totalLicenca == 0) {
                        break
                    }
                    ausenciaData[funcionario.usuario_nome] = totalLicenca
                    break;
                case 'Ausências com justificativa':
                    const totalAusencia = ausenciasJustificadas.filtradas.filter(a => a.usuarioCod === funcionario.usuario_cod).length
                    if (totalAusencia == 0) {
                        break
                    }
                    ausenciaData[funcionario.usuario_nome] = totalAusencia
                    break;
                case 'Ausências sem justificativa':
                    const totalAusenciaNao = ausenciasNaoJustificadas.filtradas.filter(a => a.usuarioCod === funcionario.usuario_cod).length
                    if (totalAusenciaNao == 0) {
                        break
                    }
                    ausenciaData[funcionario.usuario_nome] = totalAusenciaNao
                    break;
                case 'Ausências Totais':
                    const qtdAusenciasJustificadas = ausenciasJustificadas.filtradas.filter(ausencia => ausencia.usuarioCod === funcionario.usuario_cod);
                    const qtdAusenciasNaoJustificadas = ausenciasNaoJustificadas.filtradas.filter(ausencia => ausencia.usuarioCod === funcionario.usuario_cod);
                    const qtdLicencas = licencasMedicas.filtradas.filter(licenca => licenca.usuarioCod === funcionario.usuario_cod);
                    const total = qtdAusenciasJustificadas.length + qtdAusenciasNaoJustificadas.length + qtdLicencas.length;
                    ausenciaData[funcionario.usuario_nome] = total;
                    break;
            }
        })

        const sortedEntries = Object.entries(ausenciaData).sort((a, b) => b[1] - a[1])
        const sortedAusenciaData = Object.fromEntries(sortedEntries)
        setQtdAusencias(sortedAusenciaData)
    }

    const paginatedData = useMemo(() => {
        if (!qtdAusencia) return {};

        const entries = Object.entries(qtdAusencia);
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const pageEntries = entries.slice(startIndex, endIndex);

        return Object.fromEntries(pageEntries);
    }, [qtdAusencia, currentPage]);

    const totalPages = qtdAusencia ? Math.ceil(Object.keys(qtdAusencia).length / itemsPerPage) : 0;

    useEffect(() => {
        fetchUsuarios()
        fetchFaltas()
        fetchSolicitacoes()
        fetchFolgas()
        const currentDate = new Date().toISOString().split("T")[0]
        setHoje(currentDate)
    }, [])

    const filteredData = useMemo(() => {
        return filterData();
    }, [dataInicio, dataFim])

    useEffect(() => {
        setAusenciasJustificadas(prevState => ({ ...prevState, filtradas: filteredData.ausenciasJustificadas }));
        setAusenciasNaoJustificadas(prevState => ({ ...prevState, filtradas: filteredData.ausenciasNaoJustificadas }));
        setLicencasMedicas(prevState => ({ ...prevState, filtradas: filteredData.licencasMedicas }));
        setFolgas(prevState => ({ ...prevState, filtradas: filteredData.folgas }));
        setFerias(prevState => ({ ...prevState, filtradas: filteredData.ferias }));
    }, [filteredData])

    useEffect(() => {
        quantidadeAusenciasFuncionario();
        setCurrentPage(1);
    }, [funcionarios, ausenciasJustificadas.filtradas, ausenciasNaoJustificadas.filtradas, licencasMedicas.filtradas, folgas.filtradas, ferias.filtradas, ausenciaSelecionada]);
    
    const showGrafico = folgas.filtradas.length > 0 || licencasMedicas.filtradas.length > 0 || ferias.filtradas.length > 0 || ausenciasJustificadas.filtradas.length > 0 || ausenciasNaoJustificadas.filtradas.length > 0
    
    return(
        <div>
            <div className="container mx-auto px-4 flex justify-between">
                <h1 className="text-3xl font-bold text-left">Relatório de Ausências</h1>
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
                                max={dataFim ? dataFim : hoje}
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
                                max={hoje}
                            />
                        </div>
                    </div>
                </div>

                {showGrafico && (
                    <div className="flex flex-col lg:flex-row gap-6">
                        <div className="w-full lg:w-[70%]">
                            <GraficoAusencias
                            folgas={folgas.filtradas.length}
                            licencasMedicas={licencasMedicas.filtradas.length}
                            ferias={ferias.filtradas.length}
                            ausenciasJustificadas={ausenciasJustificadas.filtradas.length}
                            ausenciasNaoJustificadas={ausenciasNaoJustificadas.filtradas.length}
                            onSliceClick={setAusenciaSelecionada}
                            />
                        </div>

                        <div className="w-full lg:w-[30%] h-[450px] flex flex-col min-w-0 items-center">
                            {qtdAusencia && (
                                <>
                                    <div className="flex-1 overflow-y-auto overflow-x-auto w-full min-w-0 flex flex-col items-center pt-6">
                                        <TabelaAusencia
                                        ausenciaDado={paginatedData}
                                        titulo={ausenciaSelecionada || 'Ausências Totais'}
                                        />
                                    </div>
                                    <div className="mt-auto pr-4">
                                        <TablePagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                        />
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {!showGrafico && (
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
        </div>
    )
}