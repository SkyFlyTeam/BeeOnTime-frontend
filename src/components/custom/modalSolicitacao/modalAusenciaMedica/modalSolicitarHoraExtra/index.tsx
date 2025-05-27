import React, { useEffect, useRef, useState } from 'react';
import "react-datepicker/dist/react-datepicker.css";
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import styles from './style.module.css';
import { solicitacaoServices } from '@/services/solicitacaoServices';
import { toast } from 'react-toastify';
import { Calendar } from "@/components/ui/calendar";
import { pt } from 'date-fns/locale';
import { ApiException } from '@/config/apiExceptions';
import SolicitacaoInterface from '@/interfaces/Solicitacao';

interface SolicitarHoraExtraContentProps {
  solicitacao?: SolicitacaoInterface
  usuarioCod: number;
  cargaHoraria: number;
  onClose?: () => void;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}

const ModalSolictarAusenciaMedica = ({ usuarioCod, cargaHoraria, solicitacao, onClose, onSolicitacaoUpdate }: SolicitarHoraExtraContentProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [mensagem, setMensagem] = useState<string>('');
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
    // Sua lógica para buscar ponto atual e setar horarioSaidaPrevista
  };

  useEffect(() => {
    if (solicitacao && !isInitialized) {
      let dataToSet: Date;
      if (Array.isArray(solicitacao.solicitacaoDataPeriodo)) {
        dataToSet = new Date(solicitacao.solicitacaoDataPeriodo[0]);
      } else {
        dataToSet = new Date(solicitacao.solicitacaoDataPeriodo);
      }
      setStartDate(dataToSet);
      setMensagem(solicitacao.solicitacaoMensagem);
      setHorasSolicitadas(solicitacao.horasSolicitadas || 0);
      setIsInitialized(true);
    } else if (!solicitacao && !isInitialized) {
      fetchPontoAtual();
      setIsInitialized(true);
    }
  }, [solicitacao, isInitialized]);

  const handleSubmit = async () => {
    try {
      if (!mensagem) {
        toast.error('Justifique sua ausência médica!');
        return;
      }

      const solicitacaoJson = {
        solicitacaoMensagem: mensagem,
        usuarioCod,
        horasSolicitadas,
        solicitacaoDataPeriodo: [startDate],  // array de Date
        tipoSolicitacaoCod: { tipoSolicitacaoCod: 6 }
      };

      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }

      if (solicitacao) {
        const updateJson: SolicitacaoInterface = {
          ...solicitacao,
          solicitacaoMensagem: mensagem,
          horasSolicitadas: horasSolicitadas ?? 0,
          solicitacaoDataPeriodo: [startDate],  // array de Date
          tipoSolicitacaoCod: { tipoSolicitacaoCod: 6, tipoSolicitacaoNome: 'Ausência médica' },
          usuarioCod,
        };

        const updated = await solicitacaoServices.updateSolicitacao(updateJson);

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
          mode="single"
          selected={startDate}
          onSelect={(date) => {
            if (date) {
              setStartDate(date);
            }
          }}
          className="rounded-md border"
        />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-0.5">
          <label>Justificativa</label>
          <div className={styles.justificativa_content}>
            <input
              type="text"
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
      </div>

      <div className={styles.button_container}>
        <Button variant="warning" size="sm" onClick={handleSubmit}>
          Enviar
        </Button>
      </div>
    </>
  );
};

export default ModalSolictarAusenciaMedica;