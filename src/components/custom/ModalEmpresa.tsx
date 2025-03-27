// src/components/Modal.tsx
"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  etapaAtual: number;
}

import "./styles/modalEmpresa.css";

export default function Modal({ isOpen, onClose, title, children, etapaAtual }: ModalProps) {
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
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="progress">
            {/* Etapa 1: Empresa */}
            <div className={`circle ${etapaAtual >= 1 ? "active" : "done"}`}>
              <div className="label"></div>
              <div className="title">Empresa</div>
            </div>
            {/* Bar between Empresa and Setores */}
            <div className={`bar ${etapaAtual > 1 ? "active" : "done"}`}></div>
            {/* Etapa 2: Setores */}
            <div className={`circle ${etapaAtual >= 2 ? "active" : etapaAtual > 2 ? "done" : ""}`}>
              <div className="label"></div>
              <div className="title">Setores</div>
            </div>
            {/* Bar between Setores and Administrador */}
            <div className={`bar ${etapaAtual >= 3 ? "active" : "done"}`}></div>
            {/* Etapa 3: Administrador */}
            <div className={`circle ${etapaAtual === 3 ? "active" : ""}`}>
              <div className="label"></div>
              <div className="title">Administrador</div>
            </div>
          </div>
        </div>

        {/* Conteúdo do formulário */}
          {children}
      </div>
    </div>
  );
}