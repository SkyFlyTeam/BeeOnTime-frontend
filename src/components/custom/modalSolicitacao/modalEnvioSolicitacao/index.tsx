// General
import { useState, useRef, useEffect } from 'react'

// Services
import { solicitacaoServices } from '../../../../services/solicitacaoServices'
import { pontoServices } from '../../../../services/pontoServices'

// Interfaces
import PontoProv from '../../../../interfaces/pontoProv'

// Components
import { Button } from '@/components/ui/button'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Importe o CSS do react-toastify

// Styles
import styles from './styles.module.css'

// Icons
import { Paperclip } from 'lucide-react'

interface Ponto {
  id: string;
  usuarioCod: number;
  horasCod: number;
  data: string | Date;
  pontos: { horarioPonto: string | Date; tipoPonto: number }[];
}

interface ModalCriarSolicitacaoProps {
  isOpen: boolean;
  onClose: () => void;
  ponto: Ponto;
}

const ModalCriarSolicitacao = ({ isOpen, onClose, ponto }: ModalCriarSolicitacaoProps) => {
  const [mensagem, setMensagem] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [entrada, setEntrada] = useState<string | null>(null); 
  const [inicioAlmoco, setInicioAlmoco] = useState<string | null>(null); 
  const [fimAlmoco, setFimAlmoco] = useState<string | null>(null);  
  const [saida, setSaida] = useState<string | null>(null);  

  const fileInputRef = useRef<HTMLInputElement>(null);

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
        usuarioCod: ponto.usuarioCod,
        solicitacaoDataPeriodo: ponto.data,
        tipoSolicitacaoCod: {
          tipoSolicitacaoCod: 1
        }
      };

      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }

      const result = await solicitacaoServices.createSolicitacao(formData);
      const solicitacaoPonto: PontoProv = {
        id: ponto.id,
        usuarioCod: ponto.usuarioCod,
        solicitacaoCod: 'solicitacaoCod' in result ? result.solicitacaoCod : 0,
        horasCod: ponto.horasCod,
        data: ponto.data,
        pontos: [
          { horarioPonto: entrada as string, tipoPonto: 0 },
          { horarioPonto: inicioAlmoco as string, tipoPonto: 2 },
          { horarioPonto: fimAlmoco as string, tipoPonto: 2 },
          { horarioPonto: saida as string, tipoPonto: 1 }
        ]
      }
      const resultPonto = await pontoServices.createSolicitacaoPonto(solicitacaoPonto)
      toast.success('Solicitação enviada com sucesso!', {
        position: "top-right",
        autoClose: 3000,
      })
      onClose();
    } catch (error: any) {
      console.error("Erro ao enviar solicitação:", error.message);
      toast.error('Erro ao enviar solicitação!', {
        position: "top-right",
        autoClose: 3000,
      })
    }
  };

  const organizarHorarios = () => {
    const tipoEntrada = ponto.pontos.find(p => p.tipoPonto === 0);
    const tipoAlmoco = ponto.pontos.filter(p => p.tipoPonto === 2);
    const tipoSaida = ponto.pontos.find(p => p.tipoPonto === 1);

    if (tipoEntrada) setEntrada(tipoEntrada.horarioPonto as string); 
    if (tipoAlmoco.length > 1) {
      const [almoco1, almoco2] = tipoAlmoco;
      const [almocoInicio, almocoFim] = almoco1.horarioPonto < almoco2.horarioPonto ? [almoco1.horarioPonto, almoco2.horarioPonto] : [almoco2.horarioPonto, almoco1.horarioPonto];
      
      setInicioAlmoco(almocoInicio as string);  
      setFimAlmoco(almocoFim as string);  
    }

    if (tipoSaida) setSaida(tipoSaida.horarioPonto as string);  
  };

  const [ano, mes, dia] = typeof ponto.data === 'string'
    ? ponto.data.split("-")
    : new Date(ponto.data).toISOString().split("T")[0].split("-");

  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  const abrirSeletorArquivo = () => {
    fileInputRef.current?.click();
  };

  useEffect(() => {
    if (isOpen) {
      organizarHorarios(); 
    }
  }, [isOpen, ponto]); 

  if (!isOpen) return null;

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modal_title}>Nova Solicitação de Ajuste de Ponto</p>
        <p><span className={styles.data_span}>Dia selecionado: </span>{dataFormatada}</p>

        <form className={styles.form_container}>
          <div className={styles.column}>
            <span className={styles.FormGroup}>
              <label htmlFor='entrada'>Entrada</label>
              <input
                type='time'
                className={styles.inputTime}
                id='entrada'
                value={entrada || ''}
                onChange={(e) => setEntrada(e.target.value)}
              />
            </span>
            <span className={styles.FormGroup}>
              <label htmlFor='inicio_almoco'>Início Almoço</label>
              <input
                type='time'
                className={styles.inputTime}
                id='inicio_almoco'
                value={inicioAlmoco || ''}
                onChange={(e) => setInicioAlmoco(e.target.value)}
              />
            </span>
          </div>

          <div className={styles.column}>
            <span className={styles.FormGroup}>
              <label htmlFor='fim_almoco'>Fim Almoço</label>
              <input
                type='time'
                className={styles.inputTime}
                id='fim_almoco'
                value={fimAlmoco || ''}
                onChange={(e) => setFimAlmoco(e.target.value)}
              />
            </span>
            <span className={styles.FormGroup}>
              <label htmlFor='saida'>Saída</label>
              <input
                type='time'
                className={styles.inputTime}
                id='saida'
                value={saida || ''}
                onChange={(e) => setSaida(e.target.value)}
              />
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
  );
};

export default ModalCriarSolicitacao;
