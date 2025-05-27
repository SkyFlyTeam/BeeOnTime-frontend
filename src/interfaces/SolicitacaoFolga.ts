import { useState } from "react";

interface FolgaTipo {
  folTipoCod: number;
}

// Interface de Solicitação de Folga
export default interface SolicitacaoFolgaInterface {
  folObservacao: string; // Mapeado para folObservacao no backend
  folDataPeriodo: Date[]; // Mapeado para folDataPeriodo no backend
  folgaTipo: FolgaTipo; // Mapeado para folgaTipoCod no backend
  bancoDeHoras: number; // Mapeado para folgaSaldoAtual no backend
  documento?: File | null; // Arquivo para upload
  usuarioCod: number; // Mapeado para usuario_cod no backend
  onClose: () => void; // Função para fechar o modal
}

const usuarioLogadoCod = 123; // Replace 123 with the actual value or logic to get the logged-in user's code.

const folgaTipo: FolgaTipo = { folTipoCod: 0 }; // Define a default value for folgaTipo

const [solicitacao, setSolicitacao] = useState<SolicitacaoFolgaInterface>({
  folObservacao: "", // Mapeado para folObservacao
  folDataPeriodo: [], // Mapeado para folDataPeriodo
  folgaTipo: folgaTipo, // Tipo de folga (pode ser selecionado por um dropdown)
  bancoDeHoras: 0, // Saldo de horas
  documento: null, // Arquivo para upload
  usuarioCod: usuarioLogadoCod, // ID do usuário logado
  onClose: () => {
    console.log("Modal fechado"); // Replace with actual onClose logic
  },
});