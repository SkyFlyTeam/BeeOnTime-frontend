import CalendarFerias from '@/components/custom/CalendarFerias/calendarFerias';
import styles from './style.module.css';
import { useState } from 'react';
import CalendarFeriasGestor from '../../CalendarFerias/calendarFeriasGestor';

interface ModalFeriasProps {
  userCod: number;
  onClose: () => void;
}

const ModalFeriasGestor: React.FC<ModalFeriasProps> = ({ onClose, userCod }) => {

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Botão para fechar */}
        <button onClick={onClose} className={styles.modal_close_button}>
          X
        </button>
        <p className={styles.modal_title}>Solicitação de Férias</p>
        <div>
          <CalendarFeriasGestor userPedido={userCod} />
        </div>
      </div>
    </div>
  );
};

export default ModalFeriasGestor;
