// Styles
import CalendarFerias from '@/components/custom/CalendarFerias/calendarFerias';
import styles from './style.module.css'

// Componente react
import { ReactNode, useState } from 'react';


const ModalFerias: React.FC = () => {

  const [selectedPeriodo, setSelectedPeriodo] = useState<string>("30 Dias")

  const periodos = ["30 Dias", "15 e 15 Dias", "20 e 10 Dias", "10, 15 e 5 Dias"];

  if (true) {
    return (
      <div className={styles.modal_container}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p className={styles.modal_title}>Solicitação de Férias</p>
          <div>
            <CalendarFerias/>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default ModalFerias;
