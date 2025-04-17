export default interface BancoHoras {
    bancoHorasCod: number
    bancoHorasSaldoAtual: number
    bancoHorasData: Date | string
    usuarioCod: number
    historicoCompensacoes: HistoricoCompensacao[]
    usuarioNome: string
    usuarioCargo: string
    setorCod: number
    nivelAcesso_cod: number
}

export interface HistoricoCompensacao {
    histCompensacaoCod: number
    histCompensacaoTotal: number
    tipoCompensacaoCod: TipoCompensacao[]
}

export interface TipoCompensacao {
    tipoCompensacaoCod: number,
	tipoCompensacaoName: string
}