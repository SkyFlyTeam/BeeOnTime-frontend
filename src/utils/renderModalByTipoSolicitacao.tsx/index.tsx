import React from 'react'
import SolicitacaoInterface from '@/interfaces/Solicitacao'
import ModalAjustePonto from '@/components/custom/modalSolicitacao/modalAjustePonto'
import ModalDecisaoHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalHoraExtra'
import ModalSolictarHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalSolicitarHoraExtra'
import ModalJustificativaFalta from '@/components/custom/modalSolicitacao/modalJustificativaFalta'
import ModalDecisaoAusenciaMedica from '@/components/custom/modalSolicitacao/modalAusenciaMedica/modalAusenciaMedica'
import ModalSolictarAusenciaMedica from '@/components/custom/modalSolicitacao/modalAusenciaMedica/modalSolicitarHoraExtra'

interface ModalChildrenProps {
  solicitacao: SolicitacaoInterface
  onSolicitacaoUpdate: (updated: SolicitacaoInterface) => void
  onClose: () => void
  usuarioLogadoCod: number
  usuarioCargo: string
  nivelAcessoCod?: number
  cargaHoraria?: number
}

export function renderModalChildren({
  solicitacao,
  onSolicitacaoUpdate,
  onClose,
  usuarioLogadoCod,
  usuarioCargo,
  nivelAcessoCod,
  cargaHoraria
}: ModalChildrenProps): React.ReactNode {

  const formatarData = (datas: Date[] = []): string => {
    if (datas.length === 0) return ''

    return datas
      .map(item => {
        const d = item instanceof Date
          ? item
          : new Date(item)
        return d.toLocaleDateString('pt-BR')
      })
      .join(' – ')
  }

  switch (solicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod) {
    case 1:
      return (
        <ModalAjustePonto
          diaSelecionado={formatarData(solicitacao.solicitacaoDataPeriodo)}
          solicitacaoSelected={solicitacao}
          onSolicitacaoUpdate={onSolicitacaoUpdate}
          onClose={onClose}
          usuarioLogadoCod={usuarioLogadoCod}
          usuarioCargo={usuarioCargo}
        />
      )
    
    case 4:
      return (
        <ModalJustificativaFalta
          diaSelecionado={formatarData(solicitacao.solicitacaoDataPeriodo)}
          solicitacaoSelected={solicitacao}
          onSolicitacaoUpdate={onSolicitacaoUpdate}
          onClose={onClose}
          usuarioLogadoCod={usuarioLogadoCod}
          usuarioCargo={usuarioCargo}
        />
      )

    case 5:
      if (solicitacao.solicitacaoStatus === 'PENDENTE' && usuarioLogadoCod === solicitacao.usuarioCod) {
        return (
          <ModalSolictarHoraExtra 
            solicitacao={solicitacao}
            usuarioCod={solicitacao.usuarioCod} 
            cargaHoraria={cargaHoraria ?? 0}
            onClose={onClose}
            onSolicitacaoUpdate={onSolicitacaoUpdate}
          />
        )
      } else {
        return(
          <ModalDecisaoHoraExtra
            diaSelecionado={formatarData(solicitacao.solicitacaoDataPeriodo)}
            solicitacaoSelected={solicitacao}
            onSolicitacaoUpdate={onSolicitacaoUpdate}
            onClose={onClose}
            usuarioLogadoCod={usuarioLogadoCod}
            usuarioCargo={usuarioCargo}
          />
        )
      }
      case 6:
        if (solicitacao.solicitacaoStatus === 'PENDENTE' && usuarioLogadoCod === solicitacao.usuarioCod) {
          return (
            <ModalSolictarAusenciaMedica
              solicitacao={solicitacao}
              usuarioCod={usuarioLogadoCod}
              cargaHoraria={cargaHoraria ? cargaHoraria : 0}
              onClose={onClose}
              onSolicitacaoUpdate={onSolicitacaoUpdate}
            />
          )
        } else {
          return(
            <ModalDecisaoAusenciaMedica
              diaSelecionado={formatarData(solicitacao.solicitacaoDataPeriodo)}
              solicitacaoSelected={solicitacao}
              onSolicitacaoUpdate={onSolicitacaoUpdate}
              onClose={onClose}
              usuarioLogadoCod={usuarioLogadoCod}
              usuarioCargo={usuarioCargo}
            />
          )
        }

    default:
      return null
  }
}
