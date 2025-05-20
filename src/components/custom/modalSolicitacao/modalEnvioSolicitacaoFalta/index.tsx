// General
import { useState, useRef, useEffect } from 'react'

// Services
import { solicitacaoServices } from '../../../../services/solicitacaoServices'

// Interfaces
import Faltas from '@/interfaces/faltas'

// Components
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styles
import styles from './styles.module.css'

// Icons
import { Paperclip } from 'lucide-react'

interface ModalCriarSolicitacaoProps {
  isOpen: boolean;
  onClose: () => void;
  falta: Faltas;
}

const ModalCriarSolicitacaoFalta = ({ isOpen, onClose, falta }: ModalCriarSolicitacaoProps) => {
  const [mensagem, setMensagem] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
  }

  const formatDateToISO = (date: string | Date): string => {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
  }

  const handleSubmit = async () => {
    try {
      const dataFormatada = formatDateToISO(falta.faltaDia);

      const solicitacaoJson = {
        solicitacaoMensagem: mensagem,
        usuarioCod: falta.usuarioCod,
        solicitacaoDataPeriodo: [dataFormatada], 
        tipoSolicitacaoCod: {
          tipoSolicitacaoCod: 4
        }
      };

      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }

      await solicitacaoServices.createSolicitacao(formData);

      toast.success('Solicitação enviada com sucesso!', {
        position: "top-right",
        autoClose: 3000,
      });
      onClose();
    } catch (error: any) {
      console.error("Erro ao enviar solicitação:", error.message);
      toast.error('Erro ao enviar solicitação!', {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  // Formatando a data para exibir no modal no formato DD/MM/YYYY
  const [ano, mes, dia] = typeof falta.faltaDia === 'string'
    ? falta.faltaDia.split("-")
    : new Date(falta.faltaDia).toISOString().split("T")[0].split("-");

  const dataFormatadaExibicao = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  const abrirSeletorArquivo = () => {
    fileInputRef.current?.click();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modal_title}>Nova Solicitação de justificativa de ausências</p>
        <p><span className={styles.data_span}>Dia da ausência: </span>{dataFormatadaExibicao}</p>

        <form className={styles.form_container}>
          <div className={styles.justificativa_group}>
            <label>Justificativa</label>
            <div className={styles.justificativa_content}>
              <input
                type='text'
                value={mensagem}
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
              disabled={!mensagem.trim()}
            >
              Enviar
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCriarSolicitacaoFalta;
