export interface bancoHorasMensalAdmin{
    usuarioCod: number,
    usuarioNome: string,
    dataMes: string | Date,
    totalHoras: number,
    horasContratuais: number,
    desconto: number,
    horasAbonadas: number,
    extrasPagas: number,
    saldoAcumulado: number
}

export interface bancoHorasMensalFunc{
    usuarioCod: number,
    mesAno: string | Date,
    totalHoras: number,
    horasContratuais: number,
    desconto: number,
    horasAbonadas: number,
    extrasPagas: number,
    saldoAcumulado: number
}

export interface bancoHorasDiarioFunc{
    usuarioCod: number,
    data: Date,
    totalHoras: number,
    horasContratuais: number,
    horasAbonadas: number,
    extrasPagas: number,
    saldoAcumulado: number
}

export interface bancoMensalAdminResponse{
    usuarioCod: number,
    extrasPagas: number;
    saldoAcumulado: number,
    horasAbonadas: number;
}

export interface horasMensalAdminResponse{
    usuarioCod: number,
    horasTotal: number,
    desconto: number
}

export interface bancoDiarioResponse{
    usuarioCod: number,
    data: Date,
    extrasPagas: number,
    saldoAcumulado: number,
    horasAbonadas: number;
}

export interface horasDiarioResponse{
    usuarioCod: number,
    data: Date,
    horasTotal: number,
    desconto: number,
}