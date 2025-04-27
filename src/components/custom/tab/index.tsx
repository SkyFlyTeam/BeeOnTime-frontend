import clsx from "clsx";
import styles from "./styles.module.css";

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

// export default Tab
// interface TabProps {
//   activeTab: string;  // Tab ativo como default
//   onClick: (tab: string) => void;  // Ação de clique no tab
//   tabLabels: string[];  // Array com os nomes dos tab
//   pendentesLength?: number;  // Número de pendentes, opcional
//   showBadge?: boolean;  // Controla se o badge de pendentes deve aparecer
// }

// const Tab = ({ activeTab, onClick, tabLabels, pendentesLength = 0, showBadge = true }: TabProps) => {
//   return (
//     <div className={styles.button_container}>
//       {tabLabels.map((label, index) => (
//         <button
//           key={index}
//           onClick={() => onClick(label)}  
//           className={clsx({
//             [styles.toogle]: activeTab === label,  
//           })}
//         >
//           {label.toUpperCase()} 
//           {label === 'PENDENTES' && showBadge && pendentesLength > 0 && (  
//             <span className={styles.pendente_badge}>
//               {pendentesLength}
//             </span>
//           )}
//         </button>
//       ))}
//     </div>
//   );
// };

export default Tab;
