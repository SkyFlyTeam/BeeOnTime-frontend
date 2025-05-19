interface ResumoDiaProps {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
}

import { useEffect, useState } from "react";

// Components


// Styles
import styles from "../style.module.css";


const ModalResumoDia: React.FC<ResumoDiaProps> = ({
    onClose,
    onClick,
    diaSelecionado
}) => {
    
    return (
        <>
        <div className={styles.modal_container} onClick={onClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full items-center">
                    <h4 className={styles.modalTitle}>Resumo do dia</h4>
                </div>

                <span><b className="text-[#7C7A7B]">Dia selecionado:</b> {diaSelecionado.toLocaleDateString('pt-BR')}</span>

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores ausentes</span>
                        <ul>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores de folga</span>
                        <ul>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores de férias</span>
                        <ul>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                            <li>Fábio Henrique</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ModalResumoDia;
