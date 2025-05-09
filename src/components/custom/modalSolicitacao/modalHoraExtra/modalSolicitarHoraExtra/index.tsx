// components/custom/modalSolicitacao/modalHoraExtra/SolicitarHoraExtraContent.tsx

import React, { useEffect, useState } from 'react';
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
import SolicitacaoInterface from '@/interfaces/Solicitacao';
import { ApiException } from '@/config/apiExceptions';

interface SolicitarHoraExtraContentProps {
  solicitacao?: SolicitacaoInterface
  usuarioCod: number;
  cargaHoraria: number;
  onClose?: () => void;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}


const ModalSolictarHoraExtra = ({ usuarioCod, cargaHoraria, solicitacao, onClose, onSolicitacaoUpdate }: SolicitarHoraExtraContentProps) => {
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [isInitialized, setIsInitialized] = useState(false);
  const [mensagem, setMensagem] = useState<string>();
  const [horasSolicitadas, setHorasSolicitadas] = useState<number>();
  const [horarioSaidaPrevista, setHorarioSaidaPrevista] = useState<string>();

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
      const [ano, mes, dia] = solicitacao.solicitacaoDataPeriodo.split('-').map(Number);
      const data = new Date(ano, mes - 1, dia);
      setStartDate(data);
      setMensagem(solicitacao.solicitacaoMensagem);
      setHorasSolicitadas(solicitacao.horasSolicitadas || 0);
      setIsInitialized(true)
    } else if (!solicitacao && !isInitialized) {
      fetchPontoAtual();
      setIsInitialized(true);
    }
  }, [solicitacao, isInitialized]);
  

  const handleSubmit = async () => {
    try {
      const agora = new Date();
      const horaAtual = `${agora.getHours()}:${agora.getMinutes()}`;
  
      const toMinutes = (h: string): number => {
        const [hr, min] = h.split(':').map(Number);
        return hr * 60 + min;
      };
  
      const hoje = new Date();
      const ehHoje = 
        startDate.getDate() === hoje.getDate() &&
        startDate.getMonth() === hoje.getMonth() &&
        startDate.getFullYear() === hoje.getFullYear();
  
      if (ehHoje && (toMinutes(horarioSaidaPrevista || '00:00') - toMinutes(horaAtual)) < 120) {
        toast.error('A solicitação de hora extra deve ter uma diferença de pelo menos 2 horas!');
        return;
      }
  
      if (!mensagem) {
        toast.error('Justifique sua hora extra!');
        return;
      }
  
      const solicitacaoJson = {
        solicitacaoMensagem: mensagem,
        usuarioCod,
        horasSolicitadas,
        solicitacaoDataPeriodo: format(startDate, 'yyyy-MM-dd'),
        tipoSolicitacaoCod: { tipoSolicitacaoCod: 5 }
      };
  
      const formData = new FormData();
      formData.append("solicitacaoJson", JSON.stringify(solicitacaoJson));
      
      if (solicitacao) {
        const updateJson: SolicitacaoInterface = {
          ...solicitacao,
          solicitacaoMensagem: mensagem,
          horasSolicitadas: horasSolicitadas ?? 0,
          solicitacaoDataPeriodo: format(startDate, 'yyyy-MM-dd'),
          tipoSolicitacaoCod: { tipoSolicitacaoCod: 5, tipoSolicitacaoNome: 'Hora extra' },
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
            <input type="file" style={{ display: 'none' }} />
            <Paperclip strokeWidth={1} className={styles.anexo_icon} />
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
