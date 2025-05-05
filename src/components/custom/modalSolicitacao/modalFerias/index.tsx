import CalendarFerias from '@/components/custom/CalendarFerias/calendarFerias';
import styles from './style.module.css';
import { useState } from 'react';

interface ModalFeriasProps {
  onClose: () => void;
}

const ModalFerias: React.FC<ModalFeriasProps> = ({ onClose }) => {
  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("30 Dias");

  const periodos = ["30 Dias", "15 e 15 Dias", "20 e 10 Dias", "10, 15 e 5 Dias"];

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Botão para fechar */}
        <button onClick={onClose} className={styles.modal_close_button}>
          X
        </button>
        <p className={styles.modal_title}>Solicitação de Férias</p>
        <div>
          <CalendarFerias />
        </div>
      </div>
    </div>
  );
};

export default ModalFerias;
