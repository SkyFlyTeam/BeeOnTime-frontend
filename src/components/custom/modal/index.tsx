import ModalAjustePonto from './modalAjustePonto'
import styles from './style.module.css'
import SolicitacaoInterface from '../../../interfaces/Solicitacao'
import { useAuth } from '../../../context/AuthContext'

interface ModalProps {
  isOpen: boolean;
  solicitacao: SolicitacaoInterface;
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void; 
  onClick: () => void;
  usuarioLogadoCod: number 
  usuarioCargo: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  solicitacao,
  onClick,
  onSolicitacaoUpdate,
  usuarioLogadoCod,
  usuarioCargo 
}) => {


  const solicitacaoTitle: Record<string, string> = {
    "Ajuste de ponto": "Solicitação de ajuste de ponto"
  }

  const ModalComponents: Record<
    string,
    React.FC<{
      diaSelecionado: string,
      solicitacaoSelected: SolicitacaoInterface,
      onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void,
      onClose: () => void,
      usuarioLogadoCod: number 
      usuarioCargo: string;
    }>
  > = {
    "Ajuste de ponto": ModalAjustePonto
  }


  const SelectedModal = ModalComponents[solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome]

  const [ano, mes, dia] = solicitacao.solicitacaoDataPeriodo.split("-");
  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  if (isOpen) {
    return (
      <div className={styles.modal_container} onClick={onClick}>
        <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p className={styles.modal_title}>{solicitacaoTitle[solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome]}</p>
          <p className={styles.colaborador_label}><span>Colaborador: </span>{solicitacao.usuarioNome}</p>
          <div>
            {SelectedModal && (
              <SelectedModal
                diaSelecionado={dataFormatada}
                solicitacaoSelected={solicitacao}
                onSolicitacaoUpdate={onSolicitacaoUpdate}
                onClose={onClick}
                usuarioLogadoCod={usuarioLogadoCod} 
                usuarioCargo={usuarioCargo}
              />
            )}
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default Modal;
