import clsx from 'clsx'
import styles from './style.module.css'
import { FileText } from 'lucide-react'
import SolicitacaoInterface from '@/src/interfaces/Solicitacao'
import { useEffect, useState, useRef } from 'react'

interface AjusteProps {
    diaSelecionado: string
    solicitacaoSelected: SolicitacaoInterface
}

const ModalAjustePonto: React.FC<AjusteProps> = ({diaSelecionado, solicitacaoSelected}) => {
    const modalRef = useRef<HTMLDivElement>(null)

    const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>(solicitacaoSelected)

    useEffect(() => {
        setSolicitacao(solicitacaoSelected);
    }, [solicitacao]);

    // const handleClickOutside = (e: React.MouseEvent) => {
    //     if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
    //       onClick(); 
    //     }
    //   }

    return(
        <>
            <form className={styles.form_container}>
                <div>
                    <span className={styles.data_span}>Dia selecionado: </span>{diaSelecionado}
                </div>

                <div className={styles.column}>
                    <span className={styles.FormGroup}>
                        <label htmlFor='entrada'>Entrada</label>
                        <input type='time' className={styles.inputTime} id='entrada'></input>
                    </span>
                    <span className={styles.FormGroup}>
                        <label htmlFor='inicio_almoco'>Início Almoço</label>
                        <input type='time' className={styles.inputTime} id='inicio_almoco'></input>
                    </span>
                </div>
                <div className={styles.column}>
                    <span className={styles.FormGroup}>
                        <label htmlFor='fim_almoco'>Fim Almoço</label>
                        <input type='time' className={styles.inputTime} id='fim_almoco'></input>
                    </span>
                    <span className={styles.FormGroup}>
                        <label htmlFor='saida'>Saída</label>
                        <input type='time' className={styles.inputTime} id='saida'></input>
                    </span>
                </div>
                <div className={clsx(styles.FormGroup, styles.justificativa)}>
                    <div>
                        <label>Justificativa</label>
                        <div className={styles.justificativa_content}>
                            <input 
                                type='text'
                                value={solicitacao?.solicitacaoMensagem}
                            ></input>
                            <FileText strokeWidth={1} />
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}

export default ModalAjustePonto