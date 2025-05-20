import React, { useEffect, useRef, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './style.module.css';
import { solicitacaoServices } from '@/services/solicitacaoServices';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import { Calendar } from "@/components/ui/calendar";
import { pt } from 'date-fns/locale';
import { pontoServices } from '@/services/pontoServices';
import MarcacaoPonto from '@/interfaces/marcacaoPonto';
import SolicitacaoInterface, { SolicitacaoParaEnvio } from '@/interfaces/Solicitacao';
import { ApiException } from '@/config/apiExceptions';

interface SolicitarHoraExtraContentProps {
  solicitacao?: SolicitacaoInterface
  usuarioCod: number;
  cargaHoraria: number;
  onClose?: () => void;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}

const ModalSolictarHoraExtra = ({ usuarioCod, cargaHoraria, solicitacao, onClose, onSolicitacaoUpdate }: SolicitarHoraExtraContentProps) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [mensagem, setMensagem] = useState<string>();
  const [horasSolicitadas, setHorasSolicitadas] = useState<number>();
  const [horarioSaidaPrevista, setHorarioSaidaPrevista] = useState<string>();
  const [file, setFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0];
    if (uploaded) {
      setFile(uploaded);
    }
  }
  
  const abrirSeletorArquivo = () => {
    fileInputRef.current?.click();
  };

  const fetchPontoAtual = async () => {
    const today = new Date();
    const data = today.toISOString().split('T')[0];

    const pontos = await pontoServices.getPontosByUsuario(usuarioCod) as MarcacaoPonto[];
    const pontoAtual = pontos.find(p => p.data === data);
    const entrada = pontoAtual?.pontos.find(po => po.tipoPonto === 0)?.horarioPonto;

    let horaEntrada = 0;
    let minutoEntrada = 0;

    if (typeof entrada === 'string') {
      [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
    } else if (entrada instanceof Date) {
      horaEntrada = entrada.getHours();
      minutoEntrada = entrada.getMinutes();
    }

    const saida = horaEntrada + cargaHoraria;
    setHorarioSaidaPrevista(`${saida}:${minutoEntrada}`);
  };

  useEffect(() => {
    if (solicitacao && !isInitialized) {
      const datas = Array.isArray(solicitacao.solicitacaoDataPeriodo)
        ? solicitacao.solicitacaoDataPeriodo.map(d => new Date(d))
        : [new Date()];
      setSelectedDates(datas);
      setMensagem(solicitacao.solicitacaoMensagem);
      setHorasSolicitadas(solicitacao.horasSolicitadas || 0);
      setIsInitialized(true);
    } else if (!solicitacao && !isInitialized) {
      fetchPontoAtual();
      setIsInitialized(true);
    }
  }, [solicitacao, isInitialized]);

  // Função que aceita tanto Date quanto Date[]
  const toggleDate = (dateOrDates: Date | Date[]) => {
    if (Array.isArray(dateOrDates)) {
      setSelectedDates(dateOrDates);
    } else {
      setSelectedDates(prev => {
        const exists = prev.some(d => d.toDateString() === dateOrDates.toDateString());
        if (exists) {
          return prev.filter(d => d.toDateString() !== dateOrDates.toDateString());
        } else {
          return [...prev, dateOrDates];
        }
      });
    }
  };

  const handleSubmit = async () => {
    try {
      const agora = new Date();
      const horaAtual = `${agora.getHours()}:${agora.getMinutes()}`;

      const toMinutes = (h: string): number => {
        const [hr, min] = h.split(':').map(Number);
        return hr * 60 + min;
      };

      const hoje = new Date();
      const ehHoje = selectedDates.some(d =>
        d.getDate() === hoje.getDate() &&
        d.getMonth() === hoje.getMonth() &&
        d.getFullYear() === hoje.getFullYear()
      );

      if (ehHoje && (toMinutes(horarioSaidaPrevista || '00:00') - toMinutes(horaAtual)) < 120) {
        toast.error('A solicitação de hora extra deve ter uma diferença de pelo menos 2 horas!');
        return;
      }

      if (!mensagem) {
        toast.error('Justifique sua hora extra!');
        return;
      }

      const solicitacaoJson: SolicitacaoParaEnvio = {
        solicitacaoMensagem: mensagem,
        usuarioCod,
        horasSolicitadas,
        solicitacaoDataPeriodo: selectedDates.map(d => d.toISOString().slice(0, 10)),
        tipoSolicitacaoCod: { tipoSolicitacaoCod: 5 }
      };

      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));

      if (solicitacao) {
        const updateJson: SolicitacaoParaEnvio = {
          ...solicitacao,
          solicitacaoMensagem: mensagem,
          horasSolicitadas: horasSolicitadas ?? 0,
          solicitacaoDataPeriodo: selectedDates.map(d => d.toISOString().slice(0, 10)),
          tipoSolicitacaoCod: { tipoSolicitacaoCod: 5, tipoSolicitacaoNome: 'Hora extra' },
          usuarioCod,
        };

        const updated = await solicitacaoServices.updateSolicitacao(updateJson as any);

        toast.success('Solicitação atualizada com sucesso!');

        onClose?.();

        if (!(updated instanceof ApiException) && onSolicitacaoUpdate) {
          onSolicitacaoUpdate(updated);
        }
      } else {
        const created = await solicitacaoServices.createSolicitacao(formData);
        toast.success('Solicitação enviada com sucesso!');

        onClose?.();

        if (!(created instanceof ApiException) && onSolicitacaoUpdate) {
          onSolicitacaoUpdate(created);
        }
      }

    } catch (error) {
      toast.error('Erro ao enviar solicitação!');
    }
  };

  return (
    <>
      <div>
        <span className={styles.data_span}>Dias solicitados: </span>
      </div>
      <div className={styles.calendar_container}>
        <Calendar
          locale={pt}
          mode="multiple"
          selected={selectedDates}
          onSelect={(date) => {
            if (date) toggleDate(date);
          }}
          className="rounded-md border"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <label htmlFor="inHoras">Horas diárias</label>
          <input
            type="number"
            className={styles.input_hours}
            onChange={(e) => setHorasSolicitadas(+e.target.value)}
            value={horasSolicitadas ?? ''}
          />
        </div>

        <div className="flex flex-col gap-0.5">
          <label>Justificativa</label>
          <div className={styles.justificativa_content}>
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
            />
            {/* Upload de arquivo comentado */}
            {/* <input
              type='file'
              ref={fileInputRef}
              onChange={handleFile}
              style={{ display: 'none' }}
            />
            <Paperclip
              strokeWidth={1}
              className={styles.anexo_icon}
              onClick={abrirSeletorArquivo}
            /> */}
          </div>
        </div>
      </div>

      <div className={styles.button_container}>
        <Button variant="warning" size="sm" onClick={handleSubmit}>
          Enviar
        </Button>
      </div>
    </>
  );
};

export default ModalSolictarHoraExtra;
