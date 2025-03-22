import ModalAjustePonto from './modalAjustePonto'
import styles from './style.module.css'
import Button from 'react-bootstrap/Button'
import SolicitacaoInterface from '../../../interfaces/Solicitacao'
import { solicitacaoServices } from '@/src/services/solicitacaoServices'

interface ModalProps {
  isOpen: boolean;
  solicitacao: SolicitacaoInterface;
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void; 
  onClick: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, solicitacao, onClick, onSolicitacaoUpdate }) => {
  const solicitacaoTitle: Record<string, string> = {
    "Ajuste de ponto": "Solicitação de ajuste de ponto"
  }

  const ModalComponents: Record<string, React.FC<{ diaSelecionado: string, solicitacaoSelected: SolicitacaoInterface }>> = {
    "Ajuste de ponto": ModalAjustePonto
  }

  const SelectedModal = ModalComponents[solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome]

  const [ano, mes, dia] = solicitacao.solicitacaoDataPeriodo;
  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  const handleSolicitacao = async (status: string) => {
    const updatedSolicitacao = {...solicitacao, solicitacaoStatus: status}
    await solicitacaoServices.updateSolicitacao(updatedSolicitacao)
    onSolicitacaoUpdate(updatedSolicitacao)
    onClick()
  }
  
  if (isOpen) {
    return (
      <div className={styles.modal_container}>
        <div className={styles.modal}>
          <p>{solicitacaoTitle[solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome]}</p>
          <p><span>Colaborador: </span>{solicitacao.usuarioCod}</p>
          <div>
            {SelectedModal && <SelectedModal diaSelecionado={dataFormatada} solicitacaoSelected={solicitacao} />}
          </div>
          <div className={styles.button_container}>
            <Button 
              variant='outline-danger' 
              onClick={() => handleSolicitacao("REPROVADA")}
              size='sm'
            >
              Recusar
            </Button>
            <Button 
              variant='outline-success' 
              onClick={() => handleSolicitacao("APROVADA")}
              size='sm'
            >
              Aprovar
            </Button>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Modal