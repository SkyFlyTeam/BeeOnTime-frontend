"use client";

import style from "../../styles/modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  isSecondModal: boolean;
}

export default function Modal({ isOpen, onClose, title, children, isSecondModal }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className={style["modal-overlay"]}>
      <div className={style["modal-container"]}>
        <div className={style["modal-header"]}>
          <h2 className={style["modal-title"]}>{title}</h2>
          <button onClick={onClose} className={style["modal-close"]}>
            ×
          </button>
        </div>

        {/* Barra de progresso abaixo do título */}
        <div className={style["progress"]}>
          <div className={`${style["circle"]} ${isSecondModal ? style["active"] : style["active"]}`}>
            <div className={style["label"]}></div>
            <div className={style["title"]}>Usuário</div>
          </div>
          <div className={`${style["bar"]} ${isSecondModal ? style["active"] : ""}`}></div>
          <div className={`${style["circle"]} ${isSecondModal ? style["active"] : style["done"]}`}>
            <div className={style["label"]}></div>
            <div className={style["title"]}>Jornada</div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        {/* <form className={styles["modal-form"]}> */}
          {children}
        {/* </form> */}
      </div>
    </div>
  );
}
