// General
import { useState, useRef, useEffect } from 'react'

// Services
import { solicitacaoServices } from '../../../../services/solicitacaoServices'
import { pontoServices } from '../../../../services/pontoServices'

// Interfaces
import PontoProv from '../../../../interfaces/pontoProv'

// Components
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Styles
import styles from './styles.module.css'

// Icons
import { Paperclip } from 'lucide-react'

interface Ponto {
  id: string;
  usuarioCod: number;
  horasCod: number;
  horasData: string | Date;
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
  const [entrada, setEntrada] = useState<string>('');
  const [inicioAlmoco, setInicioAlmoco] = useState<string>('');
  const [fimAlmoco, setFimAlmoco] = useState<string>('');
  const [saida, setSaida] = useState<string>('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
  }

  // Função para formatar a data no formato 'YYYY-MM-DD'
  const formatDateToISO = (date: string | Date): string => {
    if (typeof date === 'string') {
      return date.slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
  }

  const handleSubmit = async () => {
    try {
      const dataFormatada = formatDateToISO(ponto.horasData);

      const solicitacaoJson = {
        solicitacaoMensagem: mensagem,
        usuarioCod: ponto.usuarioCod,
        solicitacaoDataPeriodo: [dataFormatada], // Array de strings no formato esperado
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
        data: ponto.horasData,
        pontos: [
          { horarioPonto: entrada, tipoPonto: 0 },
          { horarioPonto: inicioAlmoco, tipoPonto: 2 },
          { horarioPonto: fimAlmoco, tipoPonto: 2 },
          { horarioPonto: saida, tipoPonto: 1 }
        ]
      }
      
      await pontoServices.createSolicitacaoPonto(solicitacaoPonto)

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

  // Formata a data para exibição DD/MM/YYYY
  const [ano, mes, dia] = typeof ponto.horasData === 'string'
    ? ponto.horasData.split("-")
    : new Date(ponto.horasData).toISOString().split("T")[0].split("-");

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
                value={entrada}
                onChange={(e) => setEntrada(e.target.value)}
              />
            </span>
            <span className={styles.FormGroup}>
              <label htmlFor='inicio_almoco'>Início Almoço</label>
              <input
                type='time'
                className={styles.inputTime}
                id='inicio_almoco'
                value={inicioAlmoco}
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
                value={fimAlmoco}
                onChange={(e) => setFimAlmoco(e.target.value)}
              />
            </span>
            <span className={styles.FormGroup}>
              <label htmlFor='saida'>Saída</label>
              <input
                type='time'
                className={styles.inputTime}
                id='saida'
                value={saida}
                onChange={(e) => setSaida(e.target.value)}
              />
            </span>
          </div>

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

export default ModalCriarSolicitacao;
