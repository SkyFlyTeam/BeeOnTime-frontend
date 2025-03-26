import styles from './styles.module.css'
import { useState } from 'react'
import Button from 'react-bootstrap/Button'

interface ModalDevolutivaProps {
  isOpen: boolean
  onClose: () => void
  solicitacaoDevolutiva: string  
  onConfirmReject: (message: string) => void 
}

const ModalDevolutiva: React.FC<ModalDevolutivaProps> = ({
  isOpen,
  onClose,
  solicitacaoDevolutiva,
  onConfirmReject
}) => {
  const [devolutiva, setDevolutiva] = useState(solicitacaoDevolutiva)

  if (!isOpen) return null

  const handleReject = () => {
    onConfirmReject(devolutiva); 
  }
  

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modal_title}>Recusar solicitação</p>
        <div className={styles.modal_content}>
            <label htmlFor='devolutiva'>Devolutiva</label>
            <input 
            type="text" 
            id='devolutiva' 
            value={devolutiva} 
            onChange={(e) => setDevolutiva(e.target.value)} 
            />
        </div>
        <div className={styles.button_container}>
            <Button
            variant='outline-danger'
            onClick={handleReject} 
            size='sm'
            >
            Recusar
            </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalDevolutiva
