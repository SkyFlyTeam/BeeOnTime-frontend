import clsx from 'clsx'
import styles from './style.module.css'
import { FileText } from 'lucide-react'
import SolicitacaoInterface from '@/src/interfaces/Solicitacao'
import { useEffect, useState } from 'react'
import Button from 'react-bootstrap/Button'
import { solicitacaoServices } from '@/src/services/solicitacaoServices'

interface AjusteProps {
  diaSelecionado: string
  solicitacaoSelected: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
}

const ModalAjustePonto: React.FC<AjusteProps> = ({
  diaSelecionado,
  solicitacaoSelected,
  onSolicitacaoUpdate,
  onClose,
  usuarioLogadoCod
}) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>(solicitacaoSelected)

  useEffect(() => {
    const decodeBase64ToByteArray = (base64: string): number[] => {
      const binary = atob(base64);
      const bytes = new Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      return bytes;
    };
  
    const ajustada = { ...solicitacaoSelected };
  
    if (typeof ajustada.solicitacaoAnexo === 'string') {
      ajustada.solicitacaoAnexo = decodeBase64ToByteArray(ajustada.solicitacaoAnexo);
    }
  
    setSolicitacao(ajustada);
  }, [solicitacaoSelected]);

  const handleSolicitacao = async (status: string) => {
    const updatedSolicitacao = { ...solicitacao, solicitacaoStatus: status }
    await solicitacaoServices.updateSolicitacao(updatedSolicitacao)
    onSolicitacaoUpdate(updatedSolicitacao)
    onClose()
  }

  const handleDownload = () => {
    if (!solicitacao?.solicitacaoAnexo || solicitacao.solicitacaoAnexo.length === 0) return;
    console.log(solicitacao?.solicitacaoAnexo)
    const byteArray = new Uint8Array(solicitacao.solicitacaoAnexo);
    const blob = new Blob([byteArray], {
      type: 'application/octet-stream',
    });
    console.log(byteArray)
    console.log(blob)
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = solicitacao.solicitacaoAnexoNome || 'anexo.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  
  

  return (
    <>
      <form className={styles.form_container}>
        <div>
          <span className={styles.data_span}>Dia selecionado: </span>{diaSelecionado}
        </div>

        <div className={styles.column}>
          <span className={styles.FormGroup}>
            <label htmlFor='entrada'>Entrada</label>
            <input type='time' className={styles.inputTime} id='entrada' />
          </span>
          <span className={styles.FormGroup}>
            <label htmlFor='inicio_almoco'>Início Almoço</label>
            <input type='time' className={styles.inputTime} id='inicio_almoco' />
          </span>
        </div>
        <div className={styles.column}>
          <span className={styles.FormGroup}>
            <label htmlFor='fim_almoco'>Fim Almoço</label>
            <input type='time' className={styles.inputTime} id='fim_almoco' />
          </span>
          <span className={styles.FormGroup}>
            <label htmlFor='saida'>Saída</label>
            <input type='time' className={styles.inputTime} id='saida' />
          </span>
        </div>
        <div className={clsx(styles.FormGroup, styles.justificativa)}>
          <div>
            <label>Justificativa</label>
            <div className={styles.justificativa_content}>
              <input
                type='text'
                value={solicitacao?.solicitacaoMensagem}
                readOnly={usuarioLogadoCod !== solicitacao.usuarioCod || solicitacao.solicitacaoStatus !== "PENDENTE"}
                onChange={(e) => {
                  if (usuarioLogadoCod === solicitacao.usuarioCod) {
                    setSolicitacao(prev => ({
                      ...prev,
                      solicitacaoMensagem: e.target.value
                    }));
                  }
                }}
              />
              
              {solicitacao?.solicitacaoAnexo && (
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Baixar anexo"
                  style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
                >
                  <FileText strokeWidth={1} />
                </button>
              )}
            </div>
          </div>
        </div>


        {usuarioLogadoCod !== solicitacao.usuarioCod && solicitacao.solicitacaoStatus === "PENDENTE" && (
          <div className={styles.button_container}>
            <Button
              variant='outline-danger'
              onClick={() => handleSolicitacao("REPROVADA")}
              size='sm'
            >
              Recusar
            </Button>
            <Button
              variant='outline-success'
              onClick={() => handleSolicitacao("APROVADA")}
              size='sm'
            >
              Aprovar
            </Button>
          </div>
        )}

        {(usuarioLogadoCod === solicitacao.usuarioCod && solicitacao.solicitacaoStatus === "PENDENTE") && (
          <div className={styles.button_container}>
            <Button
              variant='warning'
              onClick={() => handleSolicitacao("PENDENTE")}
              size='sm'
            >
              Enviar
            </Button>
          </div>
        )}
      </form>
    </>
  )
}

export default ModalAjustePonto
