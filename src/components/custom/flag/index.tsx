import clsx from 'clsx';
import styles from './styles.module.css';

const Flag = ({ status }: { status: string }) => {
  return (
    <span className={clsx(styles.badge, {
        [styles.ferias]: status === "Férias",
        [styles.folga]: status === "Folga",
        [styles.ausencia]: status === "Ausência",
        [styles.ponto]: status === "Ajuste de ponto",
        [styles.extra]: status === "Hora extra",
    })}>
      {status === "Ajuste de ponto" ? "Ponto" : status}
    </span>
  );
};

export default Flag;
