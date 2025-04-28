"use client";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  etapaAtual: number;
}

import "./modalEmpresa.css";

export default function Modal({ isOpen, onClose, title, children, etapaAtual }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="modal-header">
          <h2 className="modal-title">{title}</h2>
          {/* <button onClick={onClose} className="modal-close">×</button> */}
        </div>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div className="progress">
            <div className={`circle ${etapaAtual >= 1 ? "active" : "done"}`}>
              <div className="label"></div>
              <div className={`title ${etapaAtual >= 1 ? "active" : ""}`}>Empresa</div>
            </div>
            <div className={`bar ${etapaAtual > 1 ? "active" : "done"}`}></div>
            <div className={`circle ${etapaAtual >= 2 ? "active" : etapaAtual > 2 ? "done" : ""}`}>
              <div className="label"></div>
              <div className={`title ${etapaAtual >= 2 ? "active" : ""}`}>Setores</div>
            </div>
            <div className={`bar ${etapaAtual >= 3 ? "active" : "done"}`}></div>
            <div className={`circle ${etapaAtual === 3 ? "active" : ""}`}>
              <div className="label"></div>
              <div className={`title ${etapaAtual === 3 ? "active" : ""}`}>Administrador</div>
            </div>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}