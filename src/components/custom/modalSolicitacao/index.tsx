// Styles
import styles from './style.module.css'

// Interfaces
import SolicitacaoInterface from '../../../interfaces/Solicitacao'

// Componente react
import { ReactNode, useState } from 'react';
import ModalFeriasGestor from './modalFerias/modalGestor';

interface ModalProps {
  isOpen: boolean
  solicitacao?: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void;
  onClick: () => void
  usuarioLogadoCod?: number 
  usuarioCargo?: string
  children?: ReactNode
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

  const [isModalFeriasOpen, setIsModalFeriasOpen] = useState<any>(true)

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
            <ModalFeriasGestor userCod = {solicitacao!.usuarioCod} onClose={() => setIsModalFeriasOpen(null)}/>
          )}
        </div>
      )
    }

    return (
      <div className={styles.modal_container} onClick={onClick}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p className={styles.modal_title}>{titulos[title]}</p>
          <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacao!.usuarioNome}</p>
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
