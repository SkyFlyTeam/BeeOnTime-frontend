import clsx from "clsx"
import styles from "./styles.module.css"

interface SolicitacaoButton {
  toogle: boolean
  onClick: (status: 'pendentes' | 'historico' | 'analises' | 'meus pontos') => void
  pendentes_length: number
  analises_length?: number
  isGestor?: boolean
}

const Tab = ({ toogle, onClick, pendentes_length, analises_length = 0, isGestor = false }: SolicitacaoButton) => {
  if (isGestor) {
    return (
      <div className={styles.button_container}>
        <button
          onClick={() => onClick('analises')}
          className={clsx({ [styles.toogle]: toogle })}
        >
          ANÁLISES
          {analises_length > 0 && (
            <span className={styles.pendente_badge}>
              {analises_length}
            </span>
          )}
        </button>

        <button
          onClick={() => onClick('meus pontos')}
          className={clsx({ [styles.toogle]: !toogle })}
        >
          MEUS PONTOS
          <span className={styles.pendente_badge}>
            {pendentes_length}
          </span>
        </button>
      </div>
    )
  }

  return (
    <div className={styles.button_container}>
      <button
        onClick={() => onClick('pendentes')}
        className={clsx({ [styles.toogle]: toogle })}
      >
        PENDENTES
        <span className={styles.pendente_badge}>
          {pendentes_length}
        </span>
      </button>

      <button
        onClick={() => onClick('historico')}
        className={clsx({ [styles.toogle]: !toogle })}
      >
        HISTÓRICO
      </button>
    </div>
  )
}

export default Tab
