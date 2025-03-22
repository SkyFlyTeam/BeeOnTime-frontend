import React, { useState } from 'react';
import styles from './styles.module.css'
import { CircleCheck, SquareX, XCircle } from 'lucide-react';
import clsx from 'clsx';
import Flag from '@/src/components/custom/flag';
import SolicitacaoInterface from '@/src/interfaces/Solicitacao';
import { solicitacaoServices } from '@/src/services/solicitacaoServices';
import { ApiException } from '@/src/config/apiExceptions';

interface SolicitacaoCard {
  solicitacao: SolicitacaoInterface;
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void;
  onClick: () => void
}

const SolicitacaoCard = ({ solicitacao, onClick, onSolicitacaoUpdate }: SolicitacaoCard) => {
  const [ano, mes, dia] = solicitacao.solicitacaoDataPeriodo;
  const dataFormatada = `${String(dia).padStart(2, '0')}/${String(mes).padStart(2, '0')}/${ano}`;

  const handleDelete = async (idToDelete: number) => {
    const deleted = await solicitacaoServices.deleteSolicitacao(idToDelete);
  
    if (!(deleted instanceof ApiException)) {
      onSolicitacaoUpdate(deleted);
    }
  }
  
  return (
    <div className={styles.card} onClick={() => onClick()}>

      <div className={styles.card_content}>

        <div className={styles.column_one}>
          <Flag 
            status={solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome}
          />
          <span>
            {solicitacao.usuarioCod}
          </span>
        </div>

        <div className={clsx({
            [styles.column_two_pendente]: solicitacao.solicitacaoStatus == "PENDENTE",
            [styles.column_two]: solicitacao.solicitacaoStatus != "PENDENTE"
          })}>

          <div className={styles.data_span}>
            <span className={styles.data_span}>Data solicitação:</span> {dataFormatada}
            {solicitacao.solicitacaoStatus == "PENDENTE" && (
              <div
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  handleDelete(solicitacao.solicitacaoCod);
                }}
              >
                <SquareX strokeWidth={0.75} size={24} className={styles.botao_excluir }/>
              </div>
            )}
          </div>

          {(solicitacao.solicitacaoStatus !== "PENDENTE")  && (
            <div className={styles.card_status}>
              <span>
              {(solicitacao.solicitacaoStatus == "APROVADA") ? 
                <span className={styles.aprovada}>
                  <CircleCheck size={28} strokeWidth={2} absoluteStrokeWidth fill='green' color='#fff' />
                </span> :
                <span className={styles.recusada}>
                  <XCircle size={28} strokeWidth={2} absoluteStrokeWidth fill='red' color='#fff' />
                </span>
              }
              </span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default SolicitacaoCard;
