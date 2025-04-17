// Interfaces
import SolicitacaoInterface from "@/interfaces/Solicitacao"

// Styles
import styles from './style.module.css'

// Componentes
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "react-toastify"

// Services
import { solicitacaoServices } from "@/services/solicitacaoServices"
import { bancoHorasServices } from "@/services/bancoHorasService"
import { extrasPagasServices } from "@/services/extraPagaService"
import { horasServices } from "@/services/horasService"
import { ApiException } from "@/config/apiExceptions"

interface ModalBancoHorasProps {
  diaSelecionado: string
  solicitacaoSelected: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
  usuarioCargo: string
}

const ModalDecisaoHoraExtra: React.FC<ModalBancoHorasProps> = ({
    diaSelecionado,
    solicitacaoSelected,
    onSolicitacaoUpdate,
    onClose,
    usuarioLogadoCod,
    usuarioCargo
}) => {
    const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>()

    const horasToString = solicitacao && solicitacao.horasSolicitadas ? solicitacao.horasSolicitadas.toString() : ''
    let [horas, min] = horasToString.split('.')
    const minutos = min ? Math.round(Number('0.' + min) * 60) : 0
    
    const handleSubmit = async (status: string, toastMensagem: string, tipo: string) => {
        if(!solicitacao) return 

        const updatedSolicitacao = {
            ...solicitacao,
            solicitacaoStatus: status
        }

        await solicitacaoServices.updateSolicitacao(updatedSolicitacao)

        if(status == 'APROVADA') {
            if(tipo == 'Banco horas'){
                const bancoHoras = {
                    bancoHorasSaldoAtual: solicitacao.horasSolicitadas,
                    bancoHorasData: solicitacao.solicitacaoDataPeriodo,
                    usuarioCod: usuarioLogadoCod
                }
                await bancoHorasServices.createBancoHoras(bancoHoras)
            } else {
                const extraPaga = {
                    extrasPagasSaldoAtual: solicitacao.horasSolicitadas,
                    extrasPagasData: solicitacao.solicitacaoDataPeriodo,
                    usuarioCod: usuarioLogadoCod
                }
                await extrasPagasServices.createExtraspagas(extraPaga)
            }
        } 

        toast.success(toastMensagem, {
            position: "top-right",
            autoClose: 2000,
        })
        onSolicitacaoUpdate(updatedSolicitacao)
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

    const handlePagarExtra= async () => {
        const status = 'APROVADA'
        const mensagem = 'Extra paga aprovada com sucesso!'
        const tipo = "Extra paga"
        handleSubmit(status, mensagem, tipo)
    }

    useEffect(() => {
        const solicitacaoSelecionada = {...solicitacaoSelected}
        setSolicitacao(solicitacaoSelecionada)
    }, [])

    return(
        <>
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
                    value={solicitacao?.solicitacaoMensagem}
                    readOnly />
                </div>
                {solicitacao && usuarioLogadoCod != solicitacao.usuarioCod  && solicitacao.solicitacaoStatus == "PENDENTE" && (
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

export default ModalDecisaoHoraExtra