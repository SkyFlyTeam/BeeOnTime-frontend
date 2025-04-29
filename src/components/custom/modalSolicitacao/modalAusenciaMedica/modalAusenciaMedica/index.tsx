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
import { FileText } from "lucide-react"
import clsx from "clsx"

interface ModalBancoHorasProps {
  diaSelecionado: string
  solicitacaoSelected: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
  usuarioCargo: string
}

const ModalDecisaoAusenciaMedica: React.FC<ModalBancoHorasProps> = ({
    diaSelecionado,
    solicitacaoSelected,
    onSolicitacaoUpdate,
    onClose,
    usuarioLogadoCod,
    usuarioCargo
}) => {
    const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>(solicitacaoSelected)

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

    const handleAprovarAusencia= async () => {
        const status = 'APROVADA'
        const mensagem = 'Ausência médica aprovada com sucesso!'
        const tipo = "Ausencia médica"
        handleSubmit(status, mensagem, tipo)
    }

    useEffect(() => {
        const solicitacaoSelecionada = {...solicitacaoSelected}
        setSolicitacao(solicitacaoSelecionada)
    }, [])

    const handleDownload = () => {
        if (!solicitacao?.solicitacaoAnexo || solicitacao.solicitacaoAnexo.length === 0) return;
        
        let byteArray;
        
        if (typeof solicitacao.solicitacaoAnexo === 'string') {
          const base64Data = solicitacao.solicitacaoAnexo;
          const byteCharacters = atob(base64Data); 
          byteArray = new Uint8Array(byteCharacters.length);
      
          for (let i = 0; i < byteCharacters.length; i++) {
            byteArray[i] = byteCharacters.charCodeAt(i);
          }
        } else {
          byteArray = new Uint8Array(solicitacao.solicitacaoAnexo);
        }
      
        const mimeType = solicitacao.solicitacaoAnexoNome?.endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream';
        const blob = new Blob([byteArray], { type: mimeType });
      
        const url = URL.createObjectURL(blob);
      
        const link = document.createElement('a');
        link.href = url;
        link.download = solicitacao.solicitacaoAnexoNome || 'anexo.pdf'; 
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url); 
      };

    return(
        <>  
            <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacao && solicitacao.usuarioNome}</p>
            <form className={styles.form_container}>
                <div>
                    <span className={styles.data_span}>Dia(s) selecionado(s): </span>{diaSelecionado}
                </div>
                <div className={clsx(styles.FormGroup, {
                    [styles.justificativa]: !solicitacao?.solicitacaoAnexo,
                    [styles.justificativa_noFile]: solicitacao?.solicitacaoAnexo
                    })}>
                    <label>Justificativa</label>
                    <div className={styles.justificativa_content}>
                        <input
                        type="text"
                        value={solicitacao?.solicitacaoMensagem}
                        readOnly={
                            usuarioLogadoCod !== solicitacao?.usuarioCod ||
                            solicitacao.solicitacaoStatus !== 'PENDENTE'
                        }
                        onChange={(e) => {
                            if (usuarioLogadoCod === solicitacao.usuarioCod) {
                              setSolicitacao((prev) => ({
                                ...prev,
                                solicitacaoMensagem: e.target.value,
                              }))
                            }
                          }}
                        />
                        {solicitacao?.solicitacaoAnexo && (
                        <button
                            type="button"
                            onClick={handleDownload}
                            title="Baixar anexo"
                            style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            }}
                        >
                            <FileText strokeWidth={1} />
                        </button>
                        )}
                    </div>
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
                            variant={"outline-success"}
                            size={"sm"}
                            onClick={handleAprovarAusencia}
                            className={styles.button}
                        >
                            Aprovar
                        </Button>
                    </div>
                )}
            </form>
        </>
    )
}

export default ModalDecisaoAusenciaMedica