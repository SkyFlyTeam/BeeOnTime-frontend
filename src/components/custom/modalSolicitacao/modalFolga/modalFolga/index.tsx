// Interfaces
import SolicitacaoFolgaInterface from "@/interfaces/SolicitacaoFolga"

// Styles
import styles from './style.module.css'

// Componentes
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

// Services
import { solicitacaoFolgaServices } from "@/services/solicitacaoServicesFolga"
import { bancoHorasServices } from "@/services/bancoHorasService"
import { extrasPagasServices } from "@/services/extraPagaService"

interface ModalFolgaProps {
  diaSelecionado: string
  solicitacaoFolgaSelected: SolicitacaoFolgaInterface
  onSolicitacaoUpdate: (updatedSolicitacaoFolga: SolicitacaoFolgaInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
  usuarioCargo: string
}

const ModalDecisaoFolga: React.FC<ModalFolgaProps> = ({
    diaSelecionado,
    solicitacaoFolgaSelected,
    onSolicitacaoUpdate,
    onClose,
    usuarioLogadoCod,
    usuarioCargo
}) => {
    const [solicitacaoFolga, setSolicitacaoFolga] = useState<SolicitacaoFolgaInterface>()
    const [horasDisponiveis, setHorasDisponiveis] = useState<number>(0)

    // Calcular as horas solicitadas (8 horas por dia)
    const horasSolicitadas = solicitacaoFolga && solicitacaoFolga.folDataPeriodo ? solicitacaoFolga.folDataPeriodo.length * 8 : 0

    // Converter horas para string
    const horasToString = solicitacaoFolga && solicitacaoFolga.horasSolicitadas ? solicitacaoFolga.horasSolicitadas.toString() : ''
    let [horas, min] = horasToString.split('.')
    const minutos = min ? Math.round(Number('0.' + min) * 60) : 0
    
    const handleSubmit = async (status: string, toastMensagem: string, tipo: string) => {
        if (!solicitacaoFolga || horasSolicitadas > horasDisponiveis) {
            toast.error("Saldo insuficiente no banco de horas", {
                position: "top-right",
                autoClose: 2000,
            })
            return
        }

        const updatedSolicitacaoFolga = {
            ...solicitacaoFolga,
            solicitacaoFolgaStatus: status
        }

        await solicitacaoFolgaServices.updateSolicitacaoFolga(updatedSolicitacaoFolga)

        if(status === 'APROVADA') {
            if(tipo === 'Banco horas'){
                const bancoHoras = {
                    bancoHorasSaldoAtual: horasDisponiveis - horasSolicitadas, // Subtrai as horas solicitadas
                    bancoHorasData: solicitacaoFolga.solicitacaoDataPeriodo,
                    usuarioCod: solicitacaoFolga.usuario.usuarioCod,
                    bancoHorasCod: solicitacaoFolga.bancoHorasCod || 0, // Provide a default or fetched value
                    historicoCompensacoes: solicitacaoFolga.historicoCompensacoes || [], // Provide a default or fetched value
                    usuarioNome: solicitacaoFolga.usuario.usuarioNome,
                    usuarioCargo: solicitacaoFolga.usuario.usuarioCargo,
                    setorCod: solicitacaoFolga.usuario.setorCod || 0, // Provide a default or fetched value
                    nivelAcesso_cod: solicitacaoFolga.usuario.nivelAcesso_cod || 0 // Provide a default or fetched value
                }
                await bancoHorasServices.updatedBancoHoras(bancoHoras) // Atualiza o banco de horas
            } else {
                const extraPaga = {
                    extrasPagasSaldoAtual: solicitacaoFolga.horasSolicitadas,
                    extrasPagasData: solicitacaoFolga.solicitacaoDataPeriodo,
                    usuarioCod: solicitacaoFolga.usuario.usuarioCod
                }
                await extrasPagasServices.createExtraspagas(extraPaga)
            }
        } 

        toast.success(toastMensagem, {
            position: "top-right",
            autoClose: 2000,
        })
        onSolicitacaoUpdate(updatedSolicitacaoFolga)
        onClose()
    }

    const handleRecusar = async () => {
        const status = 'REPROVADA'
        const mensagem = 'Solicitação recusada com sucesso!'
        const tipo = "Recusa"
        handleSubmit(status, mensagem, tipo)
    }

    const handleBancoHoras = async () => {
        const status = 'APROVADA'
        const mensagem = 'Banco de horas aprovada com sucesso!'
        const tipo = "Banco horas"
        handleSubmit(status, mensagem, tipo)
    }

    const handlePagarExtra = async () => {
        const status = 'APROVADA'
        const mensagem = 'Extra paga aprovada com sucesso!'
        const tipo = "Extra paga"
        handleSubmit(status, mensagem, tipo)
    }

    // Verificar as horas disponíveis no banco de horas
    useEffect(() => {
        const solicitacaoFolgaSelecionada = { ...solicitacaoFolgaSelected }
        setSolicitacaoFolga(solicitacaoFolgaSelecionada)

        // Buscar horas disponíveis no banco de horas
        const fetchHorasDisponiveis = async () => {
            const response = await bancoHorasServices.getAllBancoHorasByUsuario(solicitacaoFolgaSelected.usuario.usuarioCod)
            if ('status' in response && response.status === 200) {
                if ('data' in response) {
                    setHorasDisponiveis(response.data as number)
                } else {
                    toast.error("Erro ao buscar saldo de banco de horas", {
                        position: "top-right",
                        autoClose: 2000,
                    })
                }
            } else {
                toast.error("Erro ao buscar saldo de banco de horas", {
                    position: "top-right",
                    autoClose: 2000,
                })
            }
        }
        
        fetchHorasDisponiveis()
    }, [solicitacaoFolgaSelected])

    return(
        <>  
            <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacaoFolga && solicitacaoFolga.usuario.usuarioNome}</p>
            <form className={styles.form_container}>
                <div>
                    <span className={styles.data_span}>Dia(s) selecionado(s): </span>{diaSelecionado}
                </div>
                <div>
                    <span className={styles.data_span}>Total de horas extras: </span>{horas}h {minutos > 0 ? `${minutos}min` : ''}
                </div>
                <div className={styles.justificativa_content}>
                    <label htmlFor="inJustificativa">Justificativa</label>
                    <input type="text"
                    value={solicitacaoFolga?.solicitacaoMensagem}
                    readOnly />
                </div>
                {solicitacaoFolga && usuarioLogadoCod !== solicitacaoFolga.usuario.usuarioCod  && solicitacaoFolga.solicitacaoStatus === "PENDENTE" && (
                    <div className={styles.button_container}>
                        <Button
                            variant={"outline-danger"}
                            size={"sm"}
                            onClick={handleRecusar}
                            className={styles.button}
                        >
                            Recusar
                        </Button>
                        <Button
                            variant={"outline-primary"}
                            size={"sm"}
                            onClick={handleBancoHoras}
                            className={styles.button}
                        >
                            Banco de Horas
                        </Button>
                        <Button
                            variant={"outline-success"}
                            size={"sm"}
                            onClick={handlePagarExtra}
                            className={styles.button}
                        >
                            Pagar
                        </Button>
                    </div>
                )}
            </form>
        </>
    )
}

export default ModalDecisaoFolga;