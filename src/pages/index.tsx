import styles from '../styles/Home.module.css';
import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import SolicitacaoInterface from '../interfaces/Solicitacao';
import ModalCriarSolicitacao from '../components/custom/modal/modalEnvioSolicitacao';
import { useAuth } from '@/src/context/AuthContext'; // Importa o hook

export default function Home() {
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [diaSelecionado] = useState<string>("2025-03-23");
  const [solicitacaoSelected, setSolicitacaoSelected] = useState<SolicitacaoInterface | null>(null);

  const { usuarioCod, usuarioCargo } = useAuth(); // Aqui você pega o login

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleSolicitacaoUpdate = (updatedSolicitacao: SolicitacaoInterface) => {
    console.log('Solicitação atualizada:', updatedSolicitacao);
    setSolicitacaoSelected(updatedSolicitacao);
    handleCloseModal();
  };

  return (
    <div className={styles.container}>
      <p>Usuário logado: {usuarioCargo} (ID: {usuarioCod})</p>

      <Button onClick={() => setOpenModal(true)}>Abrir Modal de Solicitação</Button>

      <ModalCriarSolicitacao
        isOpen={openModal}
        onClose={handleCloseModal}
        diaSelecionado={diaSelecionado}
        usuarioCod={usuarioCod} 
        tipoSolicitacaoCod={1}
      />
    </div>
  );
}
