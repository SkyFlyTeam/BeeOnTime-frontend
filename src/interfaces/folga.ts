export default interface Folgas {
    folgaCod?: number
    folgaDataPeriodo: Date[]
    folgaObservacao: string
    folgaDiasUteis: number
    usuarioCod: number
    folgaTipo: FolgaTipo
}

interface FolgaTipo {
    tipoFolgaCod: number
    tipoFolgaNome: string
}