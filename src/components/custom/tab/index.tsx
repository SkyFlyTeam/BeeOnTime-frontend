import clsx from "clsx";
import styles from "./styles.module.css";

interface SolicitacaoButtonProps {
  toogle: boolean;
  onClick: (status: 'pendentes' | 'historico' | 'analises' | 'meus pontos') => void;
  pendentes_length: number;
  analises_length?: number;
  isGestor?: boolean;
  showBadge?: boolean;
}

const Tab = ({
  toogle,
  onClick,
  pendentes_length,
  analises_length = 0,
  isGestor = false,
  showBadge = true,
}: SolicitacaoButtonProps) => {
  return (
    <div className={styles.button_container}>
      {isGestor ? (
        <>
          <button
            onClick={() => onClick('analises')}
            className={clsx(styles.button, { [styles.toogle]: toogle })}
          >
            Análises
            {showBadge && analises_length > 0 && (
              <span className={styles.pendente_badge}>{analises_length}</span>
            )}
          </button>

          <button
            onClick={() => onClick('meus pontos')}
            className={clsx(styles.button, { [styles.toogle]: !toogle })}
          >
            Meus pedidos
            {showBadge && pendentes_length > 0 && (
              <span className={styles.pendente_badge}>{pendentes_length}</span>
            )}
          </button>
        </>
      ) : (
        <>
          <button
            onClick={() => onClick('pendentes')}
            className={clsx(styles.button, { [styles.toogle]: toogle })}
          >
            Pendentes
            {showBadge && pendentes_length > 0 && (
              <span className={styles.pendente_badge}>{pendentes_length}</span>
            )}
          </button>

          <button
            onClick={() => onClick('historico')}
            className={clsx(styles.button, { [styles.toogle]: !toogle })}
          >
            Histórico
          </button>
        </>
      )}
    </div>
  );
};

export default Tab;
