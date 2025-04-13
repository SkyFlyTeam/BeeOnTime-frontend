// Styles
import styles from './style.module.css'

// Interfaces
import SolicitacaoInterface from '../../../interfaces/Solicitacao'

// Componente react
import { ReactNode } from 'react';

interface ModalProps {
  isOpen: boolean
  solicitacao: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void;
  onClick: () => void
  usuarioLogadoCod: number 
  usuarioCargo: string
  children: ReactNode
  title: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  solicitacao,
  onClick,
  onSolicitacaoUpdate,
  usuarioLogadoCod,
  usuarioCargo,
  children,
  title 
}) => {

  const titulos: Record<string, string> = {
    "Ajuste de ponto": "Solicitação de ajuste de ponto",
    "Hora extra": "Solicitação de hora extra",
  }

  if (isOpen) {
    return (
      <div className={styles.modal_container} onClick={onClick}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p className={styles.modal_title}>{titulos[title]}</p>
          <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacao.usuarioNome}</p>
          <div>
            {children}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Modal;
