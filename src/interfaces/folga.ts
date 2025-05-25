export default interface Folgas {
    folgaCod?: number
    folgaDataPeriodo: Date[] | string[]
    folgaObservacao: string
    folgaDiasUteis: number
    usuarioCod: number
    folgaTipo: FolgaTipo
}

interface FolgaTipo {
    tipoFolgaCod: number
    tipoFolgaNome: string
}