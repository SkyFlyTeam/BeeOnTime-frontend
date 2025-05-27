import CalendarFerias from '@/components/custom/CalendarFerias/calendarFerias';
import styles from './style.module.css';
import { useState } from 'react';
import SolicitacaoInterface from '@/interfaces/Solicitacao';

interface ModalFeriasProps {
  onClose: () => void;
  isEdicao?: boolean;
  onSolicitacaoUpdate?: (updated: SolicitacaoInterface) => void;
}

const ModalFerias: React.FC<ModalFeriasProps> = ({ onClose, isEdicao, onSolicitacaoUpdate }) => {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("30 Dias");

  const periodos = ["30 Dias", "15 e 15 Dias", "20 e 10 Dias", "10, 15 e 5 Dias"];

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Botão para fechar */}
        <button onClick={onClose} className={styles.modal_close_button}>
          X
        </button>
        {isEdicao ? (
          <p className={styles.modal_title}>Edição de Solicitação de Férias</p>
        ) : (
          <p className={styles.modal_title}>Solicitação de Férias</p>
        )}

        <div>
          <CalendarFerias isEdicao={isEdicao} onSolicitacaoUpdate={onSolicitacaoUpdate}/>
        </div>
      </div>
    </div>
  );
};

export default ModalFerias;
