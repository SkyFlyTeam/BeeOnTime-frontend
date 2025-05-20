interface DefinirFolgaCalendarioProps {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
}

import { useEffect, useState } from "react";

// Components


// Styles
import stylesModal from "../style.module.css";
import styles from './style.module.css';
import clsx from "clsx";

const ModalDefinirFolgaCalendario: React.FC<DefinirFolgaCalendarioProps> = ({
    onClose,
    onClick,
    diaSelecionado
}) => {
    
    
    return (
        <>
        <div className={stylesModal.modal_container} onClick={onClick}>
            <div className={stylesModal.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full items-center">
                    <h4 className={stylesModal.modalTitle}>Resumo do dia</h4>
                </div>

                <span><b className="text-[#7C7A7B]">Colaborador:</b> Sarah Batagioti </span>
                <span><b className="text-[#7C7A7B]">Data selecionado:</b> {diaSelecionado.toLocaleDateString('pt-BR')}</span>

                {/* <div className={clsx(styles.FormGroup, {
                          [styles.justificativa]: !solicitacao?.solicitacaoAnexo,
                          [styles.justificativa_noFile]: solicitacao?.solicitacaoAnexo
                        })}>
                          <label>Justificativa</label>
                          <div className={styles.justificativa_content}>
                            <input
                              type="text"
                              value={solicitacao?.solicitacaoMensagem}
                              readOnly={
                                usuarioLogadoCod !== solicitacao.usuarioCod ||
                                solicitacao.solicitacaoStatus !== 'PENDENTE'
                              }
                              onChange={(e) => {
                                if (usuarioLogadoCod === solicitacao.usuarioCod) {
                                  setSolicitacao((prev) => ({
                                    ...prev,
                                    solicitacaoMensagem: e.target.value,
                                  }))
                                }
                              }}
                            />
                            {solicitacao?.solicitacaoAnexo && (
                              <button
                                type="button"
                                onClick={() => handleDownload(solicitacao.solicitacaoAnexo, solicitacao.solicitacaoAnexoNome || '')}
                                title="Baixar anexo"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  padding: 0,
                                  cursor: 'pointer',
                                }}
                              >
                                <FileText strokeWidth={1} />
                              </button>
                            )}
                          </div>
                        </div> */}
            </div>
        </div>
        </>
    );
};

export default ModalDefinirFolgaCalendario;
