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
import { ApiException } from "@/config/apiExceptions"
import { FileText } from "lucide-react"
import clsx from "clsx"

// utils
import handleDownload from '@/utils/handleDownload'

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
    const [mensagem, setMensagem] = useState<string>('');
    
    // Converte horasSolicitadas para string e extrai horas e minutos
    const horasToString = solicitacao && solicitacao.horasSolicitadas ? solicitacao.horasSolicitadas.toString() : ''
    let [horas, min] = horasToString.split('.')
    const minutos = min ? Math.round(Number('0.' + min) * 60) : 0
    
    const handleSubmit = async (status: string, toastMensagem: string) => {
        if(!solicitacao) return 

        const updatedSolicitacao: SolicitacaoInterface = {
            ...solicitacao,
            solicitacaoStatus: status,
            solicitacaoMensagem: mensagem 
        }

        const response = await solicitacaoServices.updateSolicitacao(updatedSolicitacao);

        if (response instanceof ApiException) {
          toast.error('Erro ao atualizar a solicitação.');
          return;
        }

        toast.success(toastMensagem, {
            position: "top-right",
            autoClose: 2000,
        });
        onSolicitacaoUpdate(updatedSolicitacao);
        onClose();
    }

    const handleRecusar = () => {
        handleSubmit('REPROVADA', 'Solicitação recusada com sucesso!');
    }

    const handleAprovarAusencia= () => {
        handleSubmit('APROVADA', 'Ausência médica aprovada com sucesso!');
    }

    useEffect(() => {
        const solicitacaoSelecionada = { ...solicitacaoSelected };
        setSolicitacao(solicitacaoSelecionada);
        setMensagem(solicitacaoSelecionada.solicitacaoMensagem || ''); 
    }, [solicitacaoSelected]); 

    return(
        <>  
            <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacao?.usuarioNome}</p>
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
                            value={mensagem} 
                            readOnly={
                                usuarioLogadoCod !== solicitacao?.usuarioCod ||
                                solicitacao?.solicitacaoStatus !== 'PENDENTE'
                            }
                            onChange={(e) => setMensagem(e.target.value)} 
                        />
                        {solicitacao?.solicitacaoAnexo && (
                            <button
                                type="button"
                                onClick={() => handleDownload(solicitacao.solicitacaoAnexo, solicitacao.solicitacaoAnexoNome || '')}
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
                {solicitacao && usuarioLogadoCod !== solicitacao.usuarioCod && solicitacao.solicitacaoStatus === "PENDENTE" && (
                    <div className={styles.button_container}>
                        <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={handleRecusar}
                            className={styles.button}
                        >
                            Recusar
                        </Button>
                        <Button
                            variant="outline-success"
                            size="sm"
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