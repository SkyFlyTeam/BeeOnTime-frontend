// src/components/Modal.tsx
"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

import "./styles/modal.css";  // Importando o CSS

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          <button onClick={onClose} className="modal-close">
            ×
          </button>
        </div>

        {/* Barra de progresso abaixo do título */}
        <div className="progress">
          <div className="circle active">
            <div className="label"></div>
            <div className="title">Usuário</div>
          </div>
          <div className="bar done"></div>
          <div className="circle done">
            <div className="label"></div>
            <div className="title">Jornada</div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
        <form className="modal-form">
          {children}
        </form>
      </div>
    </div>
  );
}
