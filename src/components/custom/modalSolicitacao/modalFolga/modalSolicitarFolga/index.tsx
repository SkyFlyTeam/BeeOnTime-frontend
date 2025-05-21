import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { toast } from "react-toastify";
import axios from "axios";
import SolicitacaoFolgaInterface from "@/interfaces/SolicitacaoFolga";
import style from './style.module.css';
import { bancoHorasServices } from "@/services/bancoHorasService"; // Importando o serviço
import { Input } from "@/components/ui/input";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperclip } from '@fortawesome/free-solid-svg-icons'; // Importa o ícone de clipe
import { ApiUsuario } from "@/config/apiUsuario";

interface SolicitarFolgaModalProps {
  usuarioLogadoCod: number;
  onClose: () => void; // Função para fechar o modal
}



const SolicitarFolgaModal: React.FC<SolicitarFolgaModalProps> = ({
  usuarioLogadoCod,
  onClose,
}) => {

  const [solicitacao, setSolicitacao] = useState<SolicitacaoFolgaInterface>({
    bancoDeHoras: 0,
    folDataPeriodo: [],
    folObservacao: "",
    documento: null,
    folgaTipo: { folTipoCod: 1 },
    usuarioCod: usuarioLogadoCod, // Verifique se o valor está sendo passado corretamente
    onClose,
  });

  const [file, setFile] = useState<File | null>(null);

  // Função para buscar o banco de horas do colaborador
  const fetchBancoDeHoras = async () => {
    try {
      const response = await bancoHorasServices.getHorasDisponiveisPorUsuario(solicitacao.usuarioCod);
      console.log("Resposta da API:", response);

      if (typeof response === "number") {
        setSolicitacao((prev) => ({
          ...prev,
          bancoDeHoras: response,
        }));
      } else {
        toast.error("Erro ao buscar banco de horas.");
      }
    } catch (error) {
      toast.error("Erro ao buscar banco de horas.");
    }
  };

  useEffect(() => {
    fetchBancoDeHoras();
  }, [solicitacao.usuarioCod]); // Use o estado de usuarioCod para garantir que a requisição seja feita

  // Função para lidar com a seleção de múltiplas datas no calendário
  const handleDateSelect = (date: Date) => {
    setSolicitacao((prev) => ({
      ...prev,
      folDataPeriodo: [...prev.folDataPeriodo, date],
    }));
  };

  useEffect(() => {
    console.log("dataperiodo", solicitacao.folDataPeriodo)
  }, [solicitacao])

  // Função para remover uma data selecionada
  const handleDateRemove = (date: Date) => {
    setSolicitacao((prev) => ({
      ...prev,
      folDataPeriodo: prev.folDataPeriodo.filter((selectedDate) => selectedDate !== date),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
      setSolicitacao((prev) => ({
        ...prev,
        documento: e.target.files ? e.target.files[0] : null,
      }));
    }
  };

  // Função para lidar com a justificativa
  const handleJustificativaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSolicitacao((prev) => ({
      ...prev,
      justificativa: e.target.value,
    }));
  };


  console.log({
    folObservacao: solicitacao.folObservacao,
    folgaTipo: solicitacao.folgaTipo,
    usuario: { usuario_cod: solicitacao.usuarioCod },
    folDataPeriodo: solicitacao.folDataPeriodo.map(date =>
      date instanceof Date ? date.toISOString().split('T')[0] : date
    ),
  });
  




  // Função para lidar com o envio do formulário
  const handleSubmit = async () => {
    if (!solicitacao.folDataPeriodo.length || !solicitacao.folObservacao || !usuarioLogadoCod) {
      toast.error("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const formData = new FormData();

      const formattedData = solicitacao.folDataPeriodo.map(date => 
        date instanceof Date ? date.toISOString().split('T')[0] : date
      )

      // const formattedDates = folDataPeriodo.map(date => date.toISOString().split('T')[0]);


      // Prepara o payload no formato esperado
      formData.append("solicitacaoJson", JSON.stringify({
        folObservacao: solicitacao.folObservacao,
        folgaTipo: {
          folTipoCod: solicitacao.folgaTipo.folTipoCod // Assume que você está enviando o ID da folga tipo
        },
        usuario: { usuario_cod: usuarioLogadoCod }, // Aqui, você está passando o ID do usuário
        folDataPeriodo: formattedData, // Envia as datas já como uma lista de strings
      }));

      // Se houver um documento, anexa ao FormData
      if (file) {
        formData.append("solicitacaoAnexo", file);
      }

      // Faz a requisição POST
      const response = await ApiUsuario.post("/folgas/cadastrar", formData);

      if (response.status === 201) {
        toast.success("Solicitação de folga enviada com sucesso!");
      } else {
        toast.error("Erro ao enviar a solicitação de folga.");
      }
    } catch (error) {
      console.error("Erro ao enviar a solicitação de folga", error);
      toast.error("Erro ao enviar a solicitação de folga.");
    }
  };

  return (
    <div className="modal">
      <h2 className={style.modal_title}>Solicitação de Folga</h2>
      <p>Banco de horas: {solicitacao.bancoDeHoras}h</p>

      <Calendar
        mode="multiple"
        selected={solicitacao.folDataPeriodo}
        onSelect={(dates) => {
          if (Array.isArray(dates)) {
            setSolicitacao((prev) => ({
              ...prev,
              folDataPeriodo: dates,
            }));
          }
        }}
      />

      {/* Exibindo as datas selecionadas */}
      {solicitacao.folDataPeriodo.length > 0 && (
        <div className={style.selectedDatesContainer}>
          <label className={style.selectedDatesLabel}>Dias Selecionados:</label>
          <div className={style.selectedDatesWrapper}>
            {solicitacao.folDataPeriodo
              .map((date, index) => date.toLocaleDateString())
              .join(", ")}
          </div>
        </div>
      )}

      <div className={style.justificativaContainer}>
        <label>Justificativa</label>
        <div className={style.justificativaWrapper}>
          <Input
            as="textarea"
            value={solicitacao.folObservacao}
            onChange={(e) => setSolicitacao({ ...solicitacao, folObservacao: e.target.value })}
            placeholder="Escreva sua justificativa aqui"
            className={style.justificativaInput}
          />
          <button
            className={style.clipIcon}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <FontAwesomeIcon icon={faPaperclip} size="lg" />
          </button>
          {/* Input invisível para selecionar o arquivo */}
          <input
            id="fileInput"
            type="file"
            style={{ display: "none" }}
            onChange={handleFileChange}
          />
        </div>
      </div>

      <div className={style.sendButtonWrapper}>
        {/* Validação para o usuário logado poder enviar apenas suas próprias solicitações */}
          <Button onClick={handleSubmit}>Enviar</Button>
        
      </div>
    </div>
  );
};

export default SolicitarFolgaModal;
