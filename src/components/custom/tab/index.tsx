import clsx from "clsx";
import styles from "./styles.module.css";

interface TabProps {
  activeTab: string;  // Tab ativo como default
  onClick: (tab: string) => void;  // Ação de clique no tab
  tabLabels: string[];  // Array com os nomes dos tab
  pendentesLength?: number;  // Número de pendentes, opcional
  showBadge?: boolean;  // Controla se o badge de pendentes deve aparecer
}

const Tab = ({ activeTab, onClick, tabLabels, pendentesLength = 0, showBadge = true }: TabProps) => {
  return (
    <div className={styles.button_container}>
      {tabLabels.map((label, index) => (
        <button
          key={index}
          onClick={() => onClick(label)}  
          className={clsx({
            [styles.toogle]: activeTab === label,  
          })}
        >
          {label.toUpperCase()} 
          {(label === 'PENDENTES' || label === 'ANÁLISES') && showBadge && pendentesLength > 0 && (  
            <span className={styles.pendente_badge}>
              {pendentesLength}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default Tab;