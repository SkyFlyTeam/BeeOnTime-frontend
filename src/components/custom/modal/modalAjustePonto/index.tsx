import clsx from 'clsx'
import styles from './style.module.css'
import { FileText } from 'lucide-react'
import SolicitacaoInterface from '../../../../interfaces/Solicitacao'
import { useEffect, useState } from 'react'
import { solicitacaoServices } from '../../../../services/solicitacaoServices'
import ModalDevolutiva from '../modalDevolutiva'
import { pontoServices } from '../../../../services/pontoServices'
import { Ponto } from '../../../../interfaces/hisPonto'
import PontoProv, { AprovarPonto } from '../../../../interfaces/pontoProv'
import { Button } from '@/components/ui/button'


interface AjusteProps {
  diaSelecionado: string
  solicitacaoSelected: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
  usuarioCargo: string
}

const ModalAjustePonto: React.FC<AjusteProps> = ({
  diaSelecionado,
  solicitacaoSelected,
  onSolicitacaoUpdate,
  onClose,
  usuarioLogadoCod,
  usuarioCargo
}) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>(solicitacaoSelected)
  const [showDevolutivaModal, setShowDevolutivaModal] = useState(false)
  const [devolutivaMessage, setDevolutivaMessage] = useState('')
  const [ponto, setPonto] = useState<PontoProv | undefined>(undefined)
  const [idApproved, setIdToApproved] = useState<string>('')

  const [entrada, setEntrada] = useState<string | null>(null)
  const [inicioAlmoco, setInicioAlmoco] = useState<string | null>(null)
  const [fimAlmoco, setFimAlmoco] = useState<string | null>(null)
  const [saida, setSaida] = useState<string | null>(null)

  const fetchPonto = async (solicitacaoCod: number) => {
    try {
      const ponto = await pontoServices.getSolicitacaoPonto(solicitacaoCod) as PontoProv;
      if (ponto && ponto.pontos) {
        setPonto(ponto);  
        setIdToApproved(ponto.id || "default-id");
    
        const tipoEntrada = ponto.pontos.find((p) => p.tipoPonto === 0);
        const tipoSaida = ponto.pontos.find((p) => p.tipoPonto === 1);
    
        if (tipoEntrada) setEntrada(tipoEntrada.horarioPonto as string);
        const tipoAlmoco = ponto.pontos.filter((p) => p.tipoPonto === 2);

        if (tipoAlmoco.length > 1) {
          const [almoco1, almoco2] = tipoAlmoco;

          if (almoco1 && almoco2 && almoco1.horarioPonto && almoco2.horarioPonto) {
            const [almocoInicio, almocoFim] =
              almoco1.horarioPonto < almoco2.horarioPonto
                ? [almoco1.horarioPonto, almoco2.horarioPonto]
                : [almoco2.horarioPonto, almoco1.horarioPonto];

            setInicioAlmoco(almocoInicio as string);
            setFimAlmoco(almocoFim as string);
          }
        }
        
    
        if (tipoSaida) setSaida(tipoSaida.horarioPonto as string);
    }
    
      
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    const ajustada = { ...solicitacaoSelected }
    setSolicitacao(ajustada)
    fetchPonto(ajustada.solicitacaoCod)
  }, [solicitacaoSelected])

  const handleSolicitacao = async (status: string, message?: string) => {
    const updatedSolicitacao = {
      ...solicitacao,
      solicitacaoStatus: status,
      solicitacaoDevolutiva: message || solicitacao.solicitacaoDevolutiva,
    }

    // Atualiza a solicitação no banco de dados
    await solicitacaoServices.updateSolicitacao(updatedSolicitacao)
    if (ponto && status === 'APROVADA') {
      const solicitacaoPonto: AprovarPonto = {
        id: idApproved,
      }
      await pontoServices.aproveSolicitacaoPonto(solicitacaoPonto, solicitacao.solicitacaoCod)
    }

    // Chama a função de atualização após a solicitação ser aprovada ou recusada
    onSolicitacaoUpdate(updatedSolicitacao)
    onClose()
  }

  const handleDownload = () => {
    if (!solicitacao?.solicitacaoAnexo || solicitacao.solicitacaoAnexo.length === 0) return
    const byteArray = new Uint8Array(solicitacao.solicitacaoAnexo)
    const blob = new Blob([byteArray], {
      type: 'application/octet-stream',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = solicitacao.solicitacaoAnexoNome || 'anexo.txt'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const openDevolutivaModal = () => {
    setShowDevolutivaModal(true)
  }

  const closeDevolutivaModal = () => {
    setShowDevolutivaModal(false)
  }

  return (
    <>
      <form className={styles.form_container}>
        <div>
          <span className={styles.data_span}>Dia selecionado: </span>{diaSelecionado}
        </div>

        <div className={styles.column}>
          <span className={styles.FormGroup}>
            <label htmlFor="entrada">Entrada</label>
            <input
              type="time"
              className={styles.inputTime}
              id="entrada"
              value={entrada || ''}
              disabled={usuarioCargo !== 'Funcionário'}
              onChange={(e) => setEntrada(e.target.value)}
            />
          </span>
          <span className={styles.FormGroup}>
            <label htmlFor="inicio_almoco">Início Almoço</label>
            <input
              type="time"
              className={styles.inputTime}
              id="inicio_almoco"
              value={inicioAlmoco || ''}
              disabled={usuarioCargo !== 'Funcionário'}
              onChange={(e) => setInicioAlmoco(e.target.value)}
            />
          </span>
        </div>

        <div className={styles.column}>
          <span className={styles.FormGroup}>
            <label htmlFor="fim_almoco">Fim Almoço</label>
            <input
              type="time"
              className={styles.inputTime}
              id="fim_almoco"
              value={fimAlmoco || ''}
              disabled={usuarioCargo !== 'Funcionário'}
              onChange={(e) => setFimAlmoco(e.target.value)}
            />
          </span>
          <span className={styles.FormGroup}>
            <label htmlFor="saida">Saída</label>
            <input
              type="time"
              className={styles.inputTime}
              id="saida"
              value={saida || ''}
              disabled={usuarioCargo !== 'Funcionário'}
              onChange={(e) => setSaida(e.target.value)}
            />
          </span>
        </div>

        <div className={clsx(styles.FormGroup, styles.justificativa)}>
          <div>
            <label>Justificativa</label>
            <div className={styles.justificativa_content}>
              <input
                type="text"
                value={solicitacao?.solicitacaoMensagem}
                readOnly={
                  usuarioLogadoCod !== solicitacao.usuarioCod ||
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
        </div>

        {solicitacao.solicitacaoStatus === 'RECUSADA' && (
          <div className={clsx(styles.FormGroup, styles.justificativa, styles.devolutiva)}>
            <label>Devolutiva</label>
            <div className={styles.justificativa_content}>
              <input
                type="text"
                value={solicitacao?.solicitacaoDevolutiva}
                readOnly
                onChange={(e) => {
                  if (usuarioLogadoCod === solicitacao.usuarioCod) {
                    setSolicitacao((prev) => ({
                      ...prev,
                      solicitacaoDevolutiva: e.target.value,
                    }))
                  }
                }}
              />
            </div>
          </div>
        )}

        {usuarioLogadoCod !== solicitacao.usuarioCod &&
          solicitacao.solicitacaoStatus === 'PENDENTE' && (
            <div className={styles.button_container}>
              <Button variant="outline-danger" onClick={openDevolutivaModal} size="lg">
                Recusar
              </Button>
              <Button variant="outline-success" onClick={() => handleSolicitacao('APROVADA')} size="lg">
                Aprovar
              </Button>
            </div>
          )}

        {usuarioLogadoCod === solicitacao.usuarioCod && solicitacao.solicitacaoStatus === 'PENDENTE' && (
          <div className={styles.button_container}>
            <Button variant="warning" onClick={() => handleSolicitacao('PENDENTE')} size="sm">
              Enviar
            </Button>
          </div>
        )}
      </form>

      {showDevolutivaModal && (
        <ModalDevolutiva
          isOpen={showDevolutivaModal}
          onClose={closeDevolutivaModal}
          solicitacaoDevolutiva={devolutivaMessage}
          onConfirmReject={(message: string | undefined) => {
            handleSolicitacao('REPROVADA', message)
            closeDevolutivaModal()
          }}
        />
      )}
    </>
  )
}

export default ModalAjustePonto
