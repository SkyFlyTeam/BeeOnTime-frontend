// Styles
import styles from './style.module.css'

// Interfaces
import SolicitacaoInterface from '../../../interfaces/Solicitacao'

// Componente react
import { ReactNode } from 'react';
import { useState } from 'react';
import ModalFerias from './modalFerias';
import ModalFeriasGestor from './modalFerias/modalGestor';

interface ModalProps {
  isOpen: boolean
  onClick: () => void
  children: ReactNode
  title: string
  solicitacao?: SolicitacaoInterface
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClick,
  children,
  title,
  solicitacao
}) => {

  const [isModalFeriasOpen, setIsModalFeriasOpen] = useState<any>(true)

  const titulos: Record<string, string> = {
    "Ajuste de ponto": "Solicitação de ajuste de ponto",
    "Hora extra": "Solicitação de hora extra",
  }

  if (isOpen) {
    // if (title === "Férias") {
    //   return (
    //     <div>
    //       <ModalFeriasGestor onClose={onClick} userCod={solicitacao?.usuarioCod!}/>
    //     </div>
    //   )
    // }
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
