

interface DefinirFeriadoProps {
    empCod: number | undefined
    onClose: () => void
    onClick: () => void
}

// Components
import { Checkbox } from "@/components/ui/checkbox"


// Styles
import styles from './style.module.css'

const ModalDefinirFeriado: React.FC<DefinirFeriadoProps> = ({
    empCod,
    onClose,
    onClick
}) => {
  

  return (
    <>
        <div className={styles.modal_container} onClick={onClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full justify-between items-center">
                    <h4 className={styles.modalTitle}>Definir Feriado</h4>
                    <span className={styles.flagFacultativo}>Facultativo</span>
                </div>

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    <div className="flex gap-3">
                        <Checkbox className="mt-[0.2rem] w-[1.2rem] h-[1.2rem]" />
                        <div className="flex flex-col">
                            <span>01 de Janeiro - Quarta-feira</span>
                            <span className="text-gray-500">Ano novo</span>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Checkbox />
                        <div className="flex flex-col">
                            <span>01 de Janeiro - Quarta-feira</span>
                            <span className={styles.flagFacultativo}>Ano novo</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </>
  )
}

export default ModalDefinirFeriado
