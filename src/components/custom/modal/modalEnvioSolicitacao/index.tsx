import styles from './styles.module.css'
import { Paperclip } from 'lucide-react'
import { useState, useRef } from 'react'
import Button from 'react-bootstrap/Button'
import { solicitacaoServices } from '@/src/services/solicitacaoServices'

interface ModalCriarSolicitacaoProps {
  isOpen: boolean
  onClose: () => void
  diaSelecionado: string
  usuarioCod: number
  tipoSolicitacaoCod: number
}

const ModalCriarSolicitacao: React.FC<ModalCriarSolicitacaoProps> = ({
  isOpen,
  onClose,
  diaSelecionado,
  usuarioCod,
  tipoSolicitacaoCod
}) => {
  const [mensagem, setMensagem] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
  }

  const handleSubmit = async () => {
    try {
      const solicitacaoJson = {
        solicitacaoMensagem: mensagem,
        usuarioCod,
        solicitacaoDataPeriodo: diaSelecionado,
        tipoSolicitacaoCod: {
          tipoSolicitacaoCod
        }
      };
  
      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }
  
      const result = await solicitacaoServices.createSolicitacao(formData);
      onClose();
  
    } catch (error: any) {
      console.error("Erro ao enviar solicitação:", error.message);
      alert("Erro ao enviar solicitação: " + error.message);
    }
  };

  const [ano, mes, dia] = diaSelecionado.split("-");
  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
  

  const abrirSeletorArquivo = () => {
    fileInputRef.current?.click()
  }

  if (!isOpen) return null

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modal_title}>Nova Solicitação de Ajuste de Ponto</p>
        <p><span className={styles.data_span}>Dia selecionado: </span>{dataFormatada}</p>

        <form className={styles.form_container}>
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

          <div className={styles.justificativa_group}>
            <label>Justificativa</label>
            <div className={styles.justificativa_content}>
              <input
                type='text'
                onChange={(e) => setMensagem(e.target.value)}
              />
              <input
                type='file'
                ref={fileInputRef}
                onChange={handleFile}
                style={{ display: 'none' }}
              />
              <Paperclip
                strokeWidth={1}
                className={styles.anexo_icon}
                onClick={abrirSeletorArquivo}
              />
            </div>
          </div>

          <div className={styles.button_container}>
            <Button
              variant='warning'
              onClick={handleSubmit}
              size='sm'
            >
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ModalCriarSolicitacao
