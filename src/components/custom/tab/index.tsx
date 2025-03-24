import clsx from "clsx"
import styles from "./styles.module.css"

interface SolicitacaoButton {
    toogle: boolean,
    onClick: (status: 'pendentes' | 'historico') => void
    pendentes_length: number
}

const Tab = ({toogle, onClick, pendentes_length}: SolicitacaoButton) => {
    return(
        <div className={styles.button_container}>
          <button
            onClick={() => onClick('pendentes')} 
            className={clsx({
              [styles.toogle]: toogle
            })}>
            PENDENTES 
            <span className={styles.pendente_badge}>
              {pendentes_length}
            </span>
          </button>

          <button
            onClick={() => onClick('historico')} 
            className={clsx({
              [styles.toogle]: !toogle
            })}>
            HISTÓRICO
          </button>
        </div>
    )
}

export default Tab