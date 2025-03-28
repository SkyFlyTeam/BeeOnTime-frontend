import React from 'react';
import styles from './styles.module.css'
import { CircleCheck, Pencil, Trash, Trash2, XCircle } from 'lucide-react';
import clsx from 'clsx';
import Flag from '@/src/components/custom/flag';
import SolicitacaoInterface from '@/src/interfaces/Solicitacao';
import { solicitacaoServices } from '@/src/services/solicitacaoServices';
import { ApiException } from '@/src/config/apiExceptions';
import { useAuth } from '@/src/context/AuthContext';
import { BiSolidEditAlt } from "react-icons/bi";
import { AiFillDelete } from "react-icons/ai";

interface SolicitacaoCard {
  solicitacao: SolicitacaoInterface;
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void;
  onClick: () => void
  usuarioCargo: string,
  usuarioCod: number
}

const SolicitacaoCard = ({ solicitacao, onClick, onSolicitacaoUpdate }: SolicitacaoCard) => {
  const { usuarioCargo, usuarioCod } = useAuth();

  const dataFormatada = solicitacao && solicitacao.solicitacaoDataPeriodo
    ? (() => {
        const [ano, mes, dia] = solicitacao.solicitacaoDataPeriodo.split('-');
        return `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;
      })()
    : ''; 

  const isOwnSolicitacao = solicitacao && solicitacao.usuarioCod === usuarioCod;

  const handleDelete = async (idToDelete: number) => {
    const deleted = await solicitacaoServices.deleteSolicitacao(idToDelete);

    if (!(deleted instanceof ApiException)) {
      onSolicitacaoUpdate(deleted);
    }
  };

  const showName = usuarioCargo !== 'Funcionário' && solicitacao?.usuarioCod !== usuarioCod

  return (
    <div className={styles.card} onClick={() => onClick()}>
      <div className={clsx({
        [styles.card_content]: !(showName),
        [styles.card_content_name]: showName
      })}>
        <div className={clsx({
          [styles.column_one]: !showName,
          [styles.column_one_name]: showName
        })}>
          <Flag status={solicitacao?.tipoSolicitacaoCod?.tipoSolicitacaoNome || 'Desconhecido'} />
          {showName && (
            <span>{solicitacao?.usuarioNome}</span>
          )}
        </div>

        <div
          className={clsx({
            [styles.column_two_pendente]: !showName && solicitacao?.solicitacaoStatus === 'PENDENTE',
            [styles.column_two]: !showName && solicitacao?.solicitacaoStatus !== 'PENDENTE',
            [styles.column_two_pendente_name]: showName && solicitacao?.solicitacaoStatus === 'PENDENTE',
            [styles.column_two_name]: showName && solicitacao?.solicitacaoStatus !== 'PENDENTE'
          })}
        >
          <div className={clsx({
            [styles.data_span]: !showName,
            [styles.data_span_name]: showName
          })}>
            <div>
              <span>Data solicitação:</span> <span>{dataFormatada}</span>
            </div>
            {solicitacao?.solicitacaoStatus == 'PENDENTE' && isOwnSolicitacao && (
              <div className={styles.icons}>
                <BiSolidEditAlt size={22} color='#4179C9' className={styles.icon_button}/>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleDelete(solicitacao?.solicitacaoCod);
                  }}
                >
                  <AiFillDelete size={22} color='#E83838' className={styles.icon_button}/>
                </div>
              </div>
            )}
          </div>

          {solicitacao?.solicitacaoStatus !== 'PENDENTE' && (
            <div className={styles.card_status}>
              <span>
                {solicitacao?.solicitacaoStatus == 'APROVADA' ? (
                  <span className={styles.aprovada}>
                    <CircleCheck size={28} strokeWidth={2} absoluteStrokeWidth fill="green" color="#fff" className={styles.icon} />
                  </span>
                ) : (
                  <span className={styles.recusada}>
                    <XCircle size={28} strokeWidth={2} absoluteStrokeWidth fill="red" color="#fff" className={styles.icon} />
                  </span>
                )}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


export default SolicitacaoCard;