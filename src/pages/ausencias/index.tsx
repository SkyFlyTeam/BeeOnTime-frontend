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
import { getUsuario } from "@/services/authService";

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

    const [usuario, setUsuario] = useState<Usuario>()

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
            let faltasFounded = undefined
            if(usuario && usuario?.nivelAcesso.nivelAcesso_cod == 1){
                faltasFounded = await faltaServices.getBySetor(usuario.setor.setorCod)
            } else {
                faltasFounded = await faltaServices.getAll()
            }
            if (!(faltasFounded instanceof ApiException) && faltasFounded){
                const faltasArray = Array.isArray(faltasFounded) ? faltasFounded : [faltasFounded];
                const faltasJustificadas = faltasArray.filter((falta: Faltas) => falta.faltaJustificativa != null);
                const faltasNaoJustificadas = faltasArray.filter((falta: Faltas) => falta.faltaJustificativa == null);
                setAusenciasJustificadas({ausensiasJustificadas: faltasJustificadas, filtradas: faltasJustificadas});
                setAusenciasNaoJustificadas({ausensiasNaoJustificadas: faltasNaoJustificadas, filtradas: faltasNaoJustificadas});
            }
        } catch (err) {
            throw err
        }
    }

    const fetchSolicitacoes = async () => {
        try {
            let solicitacoesFounded = undefined
            if(usuario && usuario?.nivelAcesso.nivelAcesso_cod == 1){
                solicitacoesFounded = await solicitacaoServices.getAllSolicitacaoBySetorTipo(6, usuario.setor.setorCod)
            } else {
                solicitacoesFounded = await solicitacaoServices.getSolicitacaoByTipo(6)
            }
            if(!(solicitacoesFounded instanceof ApiException) && solicitacoesFounded){
                const solicitacaoArray = Array.isArray(solicitacoesFounded) ? solicitacoesFounded : [solicitacoesFounded]
                const solicitacoesAprovadas = solicitacaoArray.filter((solicitacao: SolicitacaoInterface) => solicitacao.solicitacaoStatus.toLowerCase() == "aprovada".toLowerCase())
                setLicencasMedicas({licencasMedicas: solicitacoesAprovadas, filtradas: solicitacoesAprovadas})
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
            let folgasFounded = undefined
            if(usuario && usuario?.nivelAcesso.nivelAcesso_cod == 1){
                folgasFounded = await folgaService.getBySetor(usuario.setor.setorCod)
            } else {
                folgasFounded = await folgaService.getAll()
            }
            if(!(folgasFounded instanceof ApiException) && folgasFounded) {
                const folgaFiltrada = folgasFounded.filter((folga) => folga.folgaTipo.tipoFolgaCod === 1)
                const feriasFiltrada = folgasFounded.filter((folga) => folga.folgaTipo.tipoFolgaCod === 2)
                setFolgas({folgas: folgaFiltrada, filtradas: folgaFiltrada})
                setFerias({ferias: feriasFiltrada, filtradas: feriasFiltrada})
            }
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

            const startsBeforeEnd = !dataFimDate || minDate <= dataFimDate;
            const endsAfterStart = !dataInicioDate || maxDate >= dataInicioDate;

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
                return solicitacao.solicitacaoDataPeriodo.some(dataPeriodo => {
                    const solicitacaoDate = new Date(dataPeriodo);
                    return (!dataInicio || solicitacaoDate >= new Date(dataInicio)) &&
                        (!dataFim || solicitacaoDate <= new Date(dataFim));
                });
            }),
            folgas: folgas.folgas.filter(folga => filterPeriodArray(folga.folgaDataPeriodo)),
            ferias: ferias.ferias.filter(feria => filterPeriodArray(feria.folgaDataPeriodo))
        }
    }

    const quantidadeAusenciasFuncionario = () => {
        const ausenciaData: Record<string, number> = {}

        funcionarios.forEach((funcionario) => {
            let count = 0;

            switch (ausenciaSelecionada) {
            case 'Folga':
                count = folgas.filtradas.filter(f => f.usuarioCod === funcionario.usuario_cod).length;
                break;

            case 'Férias':
                count = ferias.filtradas.filter(f => f.usuarioCod === funcionario.usuario_cod).length;
                break;

            case 'Licença médica':
                count = licencasMedicas.filtradas.filter(l => l.usuarioCod === funcionario.usuario_cod).length;
                break;

            case 'Ausências com justificativa':
                count = ausenciasJustificadas.filtradas
                .filter(a => a.usuarioCod === funcionario.usuario_cod).length;
                break;

            case 'Ausências sem justificativa':
                count = ausenciasNaoJustificadas.filtradas
                .filter(a => a.usuarioCod === funcionario.usuario_cod).length;
                break;

            case 'Ausências Totais':
            default:
                // aqui somamos **todas** as 5 categorias
                const qtdFolgas   = folgas.filtradas
                .filter(f => f.usuarioCod === funcionario.usuario_cod).length;
                const qtdFerias   = ferias.filtradas
                .filter(f => f.usuarioCod === funcionario.usuario_cod).length;
                const qtdLicenca  = licencasMedicas.filtradas
                .filter(l => l.usuarioCod === funcionario.usuario_cod).length;
                const qtdJust     = ausenciasJustificadas.filtradas
                .filter(a => a.usuarioCod === funcionario.usuario_cod).length;
                const qtdNaoJust  = ausenciasNaoJustificadas.filtradas
                .filter(a => a.usuarioCod === funcionario.usuario_cod).length;

                count = qtdFolgas + qtdFerias + qtdLicenca + qtdJust + qtdNaoJust;
                break;
            }

            // só inclui usuário com count > 0 (igual ao que você já fazia)
            if (count > 0) {
            ausenciaData[funcionario.usuario_nome] = count;
            }
        });

        // ordena do maior para o menor
        const sorted = Object.fromEntries(
            Object.entries(ausenciaData)
            .sort(([, a], [, b]) => b - a)
        );

        setQtdAusencias(sorted);
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

    const getUser = async () => {
        try {
            const { data } = await getUsuario()
            setUsuario(data)
        } catch (err) {
            throw err
        }
    }

    useEffect(() => {
        if (!usuario) return;

        fetchUsuarios()
        fetchFaltas()
        fetchSolicitacoes()
        fetchFolgas()
    }, [usuario])

    useEffect(() => {
        const hoje = new Date();

        const noventaDiasAtras = new Date();
        noventaDiasAtras.setDate(hoje.getDate() - 90);

        const formatarData = (data: Date) => data.toISOString().split('T')[0];

        setDataInicio(formatarData(noventaDiasAtras));
        setHoje(formatarData(hoje));

        getUser();
    }, []);


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
                    <div className="flex flex-col lg:flex-row gap-2 -pt-15">

                        <div className={`w-full lg:w-[65%] min-h-[200px] ${styles.wrapperGrafico}`}>
                            <GraficoAusencias
                            folgas={folgas.filtradas.length}
                            licencasMedicas={licencasMedicas.filtradas.length}
                            ferias={ferias.filtradas.length}
                            ausenciasJustificadas={ausenciasJustificadas.filtradas.length}
                            ausenciasNaoJustificadas={ausenciasNaoJustificadas.filtradas.length}
                            onSliceClick={setAusenciaSelecionada}
                            />
                        </div>

                        {qtdAusencia && (
                            <div className={`w-full lg:w-[35%] sm:h-[200px] md:h-[400px] flex flex-col min-w-0 items-center ${styles.wrapperTabela}`}>
                                <div className="flex-1 md:w-[70%] lg:w-full overflow-y-auto overflow-x-auto w-full min-w-0 flex flex-col items-center pt-6 mb-5">
                                    <TabelaAusencia
                                        ausenciaDado={paginatedData}
                                        titulo={ausenciaSelecionada}
                                    />
                                </div>
                                <div className="mt-auto pr-4 md:w-[50%]">
                                    <TablePagination
                                        currentPage={currentPage}
                                        totalPages={totalPages}
                                        onPageChange={setCurrentPage}
                                    />
                                </div>
                            </div>
                        )}
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