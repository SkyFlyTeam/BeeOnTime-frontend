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

export default function Ausencias() {
    const [folgas, setFolgas] = useState({
        folgas: [],
        filtradas: []
    })
    const [licencasMedicas, setLicencasMedicas] = useState({
        licencasMedicas: [] as SolicitacaoInterface[],
        filtradas: [] as SolicitacaoInterface[]
    })
    const [ferias, setFerias] = useState({
        ferias: [],
        filtradas: []
    })
    const [ausenciasJustificadas, setAusenciasJustificadas] = useState({
        ausensiasJustificadas: [] as Faltas[],
        filtradas: [] as Faltas[]
    })
    const [ausenciasNaoJustificadas, setAusenciasNaoJustificadas] = useState({
        ausensiasNaoJustificadas: [] as Faltas[],
        filtradas: [] as Faltas[]
    })

    const [dataInicio, setDataInicio] = useState<string>("");
    const [dataFim, setDataFim] = useState<string>("");
    const [hoje, setHoje] = useState("")
    const [funcionarios, setFuncionarios] = useState<Usuario[]>([])

    const dataInicioRef = useRef<HTMLInputElement>(null)
    const dataFimRef = useRef<HTMLInputElement>(null)

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


    const filterData = () => {
        if (!dataInicio && !dataFim) {
            return { 
                ausenciasJustificadas: ausenciasJustificadas.ausensiasJustificadas, 
                ausenciasNaoJustificadas: ausenciasNaoJustificadas.ausensiasNaoJustificadas, 
                licencasMedicas: licencasMedicas.licencasMedicas
            }
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
            })
        }
    }

    useEffect(() => {
        fetchUsuarios()
        fetchFaltas()
        fetchSolicitacoes()
        const currentDate = new Date().toISOString().split("T")[0]
        setHoje(currentDate)
    }, [])

    const filteredData = useMemo(() => {
        return filterData();
    }, [dataInicio, dataFim])

    useEffect(() => {
        setAusenciasJustificadas(prevState => ({ ...prevState, filtradas: filteredData.ausenciasJustificadas }))
        setAusenciasNaoJustificadas(prevState => ({ ...prevState, filtradas: filteredData.ausenciasNaoJustificadas }))
        setLicencasMedicas(prevState => ({ ...prevState, filtradas: filteredData.licencasMedicas }))
    }, [filteredData])
    
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
                                max={hoje}
                                min={dataInicio}
                            />
                        </div>
                    </div>
                </div>

                {showGrafico && (
                    <div>
                        < GraficoAusencias 
                            folgas={folgas.filtradas.length} 
                            licencasMedicas={licencasMedicas.filtradas.length} 
                            ferias={ferias.filtradas.length} 
                            ausenciasJustificadas={ausenciasJustificadas.filtradas.length} 
                            ausenciasNaoJustificadas={ausenciasNaoJustificadas.filtradas.length} 
                        />
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