// General  
import { useState } from 'react'

// Components
import { Button } from '@/components/ui/button'

// Styles
import styles from './styles.module.css'

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
    if (devolutiva.trim()) {
      onConfirmReject(devolutiva)
      onClose()  // Fecha o modal depois da devolutiva ser enviada
    } else {
      alert("Por favor, insira uma devolutiva antes de recusar.")
    }
  }

  return (
    <div className={styles.modal_container} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <p className={styles.modal_title}>Recusar solicitação</p>
        <div className={styles.modal_content}>
          <label htmlFor='devolutiva'>Devolutiva</label>
          <input 
            type="text" 
            id="devolutiva" 
            value={devolutiva} 
            onChange={(e) => setDevolutiva(e.target.value)} 
          />
        </div>
        <div className={styles.button_container}>
          <Button
            variant="outline-danger"
            onClick={handleReject} 
            size="lg"
          >
            Recusar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ModalDevolutiva
