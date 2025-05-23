import React from 'react'
import SolicitacaoInterface from '@/interfaces/Solicitacao'
import ModalAjustePonto from '@/components/custom/modalSolicitacao/modalAjustePonto'
import ModalDecisaoHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalHoraExtra'
import ModalSolictarHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalSolicitarHoraExtra'
import ModalJustificativaFalta from '@/components/custom/modalSolicitacao/modalJustificativaFalta'

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

  const formatarData = (data: string) => {
    const [ano, mes, dia] = data.split('-')
    const dataFormatada = `${dia.padStart(2, '0')}/${mes.padStart(2, '0')}/${ano}`
    return dataFormatada
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
      if (solicitacao.solicitacaoStatus !== 'PENDENTE' || nivelAcessoCod === 0 || nivelAcessoCod === 1) {
        return (
          <ModalDecisaoHoraExtra
            diaSelecionado={formatarData(solicitacao.solicitacaoDataPeriodo)}
            solicitacaoSelected={solicitacao}
            onSolicitacaoUpdate={onSolicitacaoUpdate}
            onClose={onClose}
            usuarioLogadoCod={usuarioLogadoCod}
            usuarioCargo={usuarioCargo}
          />
        )
      } else {
        return(
          <ModalSolictarHoraExtra 
            solicitacao={solicitacao}
            usuarioCod={solicitacao.usuarioCod} 
            cargaHoraria={cargaHoraria ?? 0}
            onClose={onClose}
            onSolicitacaoUpdate={onSolicitacaoUpdate}
          />
        )
      }
      return null

    default:
      return null
  }
}
