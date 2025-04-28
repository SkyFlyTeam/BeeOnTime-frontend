// Styles
import styles from './style.module.css'

// Interfaces
import SolicitacaoInterface from '../../../interfaces/Solicitacao'

// Componente react
import { ReactNode, useState } from 'react';
import ModalFeriasGestor from './modalFerias/modalGestor';

interface ModalProps {
  isOpen: boolean
  onClick: () => void
  children: ReactNode
  title: string
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClick,
  children,
  title 
}) => {

  const [isModalFeriasOpen, setIsModalFeriasOpen] = useState<boolean>(true)

  const titulos: Record<string, string> = {
    "Ajuste de ponto": "Solicitação de ajuste de ponto",
    "Hora extra": "Solicitação de hora extra",
    "Férias": "Solicitação de Férias",
  }

  if (isOpen) {

    if (title === "Férias") {
      return(
        <div>
          {isModalFeriasOpen && (
            <ModalFeriasGestor userCod = {solicitacao.usuarioCod} onClose={() => setIsModalFeriasOpen(false)}/>
          )}
        </div>
      )
    }

    return (
      <div className={styles.modal_container} onClick={onClick}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p className={styles.modal_title}>{titulos[title]}</p>
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
