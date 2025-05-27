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
import SolicitacaoInterface, { SolicitacaoParaEnvio } from '@/interfaces/Solicitacao';

interface SolicitarFolgaContentProps {
  solicitacao?: SolicitacaoInterface
  usuarioCod: number;
  cargaHoraria: number;
  onClose?: () => void;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}

const ModalSolicitarFolga = ({ usuarioCod, cargaHoraria, solicitacao, onClose, onSolicitacaoUpdate }: SolicitarFolgaContentProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [mensagem, setMensagem] = useState<string>('');
  const [horasSolicitadas, setHorasSolicitadas] = useState<number>();
  const [horarioSaidaPrevista, setHorarioSaidaPrevista] = useState<string>();
  const [file, setFile] = useState<File | null>(null);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

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
      toast.error('Justifique sua folga!');
      return;
    }

    // Preparar objeto para envio, com datas no formato string "yyyy-MM-dd"
    const solicitacaoParaEnvio: SolicitacaoParaEnvio = {
      solicitacaoMensagem: mensagem,
      usuarioCod,
      horasSolicitadas,
      solicitacaoDataPeriodo: selectedDates.map(date => date.toISOString().slice(0, 10)),
      tipoSolicitacaoCod: { tipoSolicitacaoCod: 3, tipoSolicitacaoNome: 'Folga' },
    };

    if (solicitacao) {
      // Atualizar solicitação
      const updateJson: SolicitacaoInterface = {
            ...solicitacao,
            solicitacaoMensagem: mensagem,
            horasSolicitadas: horasSolicitadas ?? 0,
            solicitacaoDataPeriodo: selectedDates, // Aqui mantemos Date[]
            tipoSolicitacaoCod: { tipoSolicitacaoCod: 3, tipoSolicitacaoNome: 'Folga' },
            usuarioCod,
        };

        const updated = await solicitacaoServices.updateSolicitacao(updateJson);

      toast.success('Solicitação atualizada com sucesso!');
      onClose?.();

      if (!(updated instanceof ApiException) && onSolicitacaoUpdate) {

        const periodoStrings = updated.solicitacaoDataPeriodo as unknown as string[];
        const periodoDates = periodoStrings.map(d => new Date(d));

        const updatedComDatasConvertidas: SolicitacaoInterface = {
          ...updated,
          solicitacaoDataPeriodo: periodoDates,
        };

        onSolicitacaoUpdate(updatedComDatasConvertidas);
      }
    } else {
      // Criar nova solicitação
      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoParaEnvio));
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }

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
            selected={selectedDates} // array de Date
            onSelect={(date: Date | Date[] | undefined) => {
                if (!date) return;

                if (Array.isArray(date)) {
                    const validDates = date.filter((d): d is Date => d !== undefined);
                    setSelectedDates(validDates);
                } else {
                    setSelectedDates((prevDates) => {
                    if (prevDates.some(d => d.getTime() === date.getTime())) {
                        return prevDates.filter(d => d.getTime() !== date.getTime());
                    } else {
                        return [...prevDates, date];
                    }
                    });
                }
            }}
            className="rounded-md border"
        />
      </div>
      
        {selectedDates.length > 0 && (
        <div className={`flex flex-col gap-4`}>
            <span className={`${styles.data_span}`}>
                Dias selecionados:{" "}
                {selectedDates.length > 0
                && selectedDates
                    .map(date => date.toLocaleDateString('pt-BR'))
                    .join(", ")
                }
            </span>
        </div>
        )}

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

export default ModalSolicitarFolga;