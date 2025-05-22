// General
import React from 'react'

// Config
import { ApiException } from '../../../config/apiExceptions'

// Interfaces
import Solicitacao from '../../../interfaces/Solicitacao'

// Services
import { solicitacaoServices } from '../../../services/solicitacaoServices'

// Styles
import styles from './styles.module.css'

// Icons
import { CircleCheck, XCircle } from 'lucide-react'
import { AiFillDelete } from 'react-icons/ai'
import { BiSolidEditAlt } from "react-icons/bi";

// Components
import clsx from 'clsx'
import Flag from '../../../components/custom/flag'


interface SolicitacaoCard {
  solicitacao: Solicitacao
  onSolicitacaoUpdate: (updatedSolicitacao: Solicitacao) => void
  onClick: () => void
  usuarioCargo: string
  usuarioCod: number
  usuarioLogadoCargo: string
  usuarioLogadoCod: number
  onDelete: (id: number) => void  
}

const SolicitacaoCard = ({
  solicitacao,
  onClick,
  onSolicitacaoUpdate,
  usuarioCargo,
  usuarioCod,
  usuarioLogadoCargo,
  usuarioLogadoCod,
  onDelete, // Adicionando função onDelete
}: SolicitacaoCard) => {

  // antes do return do seu componente:
  const datas = Array.isArray(solicitacao.solicitacaoDataPeriodo)
    ? solicitacao.solicitacaoDataPeriodo
    : []

  const formatado = datas.map(item => {
    const d = item instanceof Date ? item : new Date(item)
    return d.toLocaleDateString('pt-BR')
  })

  const dataFormatada =
    formatado.length === 0
      ? ''
      : formatado.length === 1
      ? formatado[0]
      : `${formatado[0]} – ${formatado[formatado.length - 1]}`



  const isOwnSolicitacao = solicitacao && solicitacao.usuarioCod === usuarioLogadoCod

  const handleDelete = async (idToDelete: number) => {
    try {
      const deleted = await solicitacaoServices.deleteSolicitacao(idToDelete);
  
      if (!(deleted instanceof ApiException)) {
        // Chama a função onDelete para remover a solicitação na página principal
        onDelete(idToDelete);
      }
    } catch (error) {
      console.error('Erro ao excluir a solicitação:', error);
    }
  };
  

  const showName = usuarioLogadoCargo !== 'Funcionário' && solicitacao?.usuarioCod !== usuarioLogadoCod

  return (
    <div className={styles.card} onClick={() => onClick()}>
      <div
        className={clsx({
          [styles.card_content]: !showName,
          [styles.card_content_name]: showName,
        })}
      >
        <div
          className={clsx({
            [styles.column_one]: !showName,
            [styles.column_one_name]: showName,
          })}
        >
          <Flag status={solicitacao?.tipoSolicitacaoCod?.tipoSolicitacaoNome || 'Desconhecido'} />
          {showName && <span>{solicitacao?.usuarioNome}</span>}
        </div>

        <div
          className={clsx({
            [styles.column_two_pendente]: !showName && solicitacao?.solicitacaoStatus === 'PENDENTE',
            [styles.column_two]: !showName && solicitacao?.solicitacaoStatus !== 'PENDENTE',
            [styles.column_two_pendente_name]: showName && solicitacao?.solicitacaoStatus === 'PENDENTE',
            [styles.column_two_name]: showName && solicitacao?.solicitacaoStatus !== 'PENDENTE',
          })}
        >
          <div
            className={clsx({
              [styles.data_span]: !showName,
              [styles.data_span_name]: showName,
            })}
          >
            <div>
              <span>Data solicitação:</span> <span>{dataFormatada}</span>
            </div>
            {solicitacao?.solicitacaoStatus == 'PENDENTE' && isOwnSolicitacao && (
              <div className={styles.icons}>
                <BiSolidEditAlt size={22} color='#4179C9' className={styles.icon_button}/>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                    e.preventDefault()
                    handleDelete(solicitacao?.solicitacaoCod) 
                  }}
                >
                  <AiFillDelete size={22} color="#E83838" className={styles.icon_button} />
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
  )
}

export default SolicitacaoCard