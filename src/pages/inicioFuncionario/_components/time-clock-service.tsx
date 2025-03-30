import { Api } from "@/config/apiHorasConfig"

interface horasDTO{
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas: number,
    horasFaltantes: number,
    horasData: string,
    usuarioCod: number
}

interface horasDTOP{
    horasExtras: number,
    horasTrabalhadas: number,
    horasNoturnas: number,
    horasFaltantes: number,
    horasData: string,
    usuarioCod: number,
    horasCod: number
}

function timeStringToHours(time: string): number {
    // Split the time string into hours, minutes, and seconds
    const [hours, minutes, seconds] = time.split(":").map(Number);

    // Convert the time into an hour unit (integer) including fractions of hours
    const totalHours = hours + (minutes / 60) + (seconds / 3600);
    return totalHours;
}


export default function TimeClockService() {
    
    // Essa função verífica se há uma entrada no banco relacional hoje, caso não haja ele cria
    const createHoras = async(data: horasDTO, diaHoje: string, usuarioCod: number) => {

        // Verifica se há uma entrada no dia de hoje

        let relationalData: horasDTO | null

        try {
            relationalData = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
        } catch (error){
            relationalData = null
            console.log(error)
        }


        if (!relationalData) {
            try{
                const response = await Api.post('/horas/cadastrar', data);
                console.log('dataRelacional criada com sucesso!')
                return response;
            } catch(error) {
                console.log(error);
                throw error;
            }
        }
        else {
            console.log('dataRelacional já criada!')
        }

    }

    const baterEntrada = async(diaHoje: string, horario: string, usuarioCod: number) => {

        let relationalData: horasDTOP

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
            relationalData = response.data
        } catch (error){
            console.log(error)
            throw error
        }

        console.log(relationalData)


        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 0
            }]
        }

        console.log(data)


        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de entrada criado com sucesso!')
            return response
        } catch (error){
            console.log('Ocorreu um erro ao criar o ponto de entrada!')
            throw error
        }

    }


    const baterInicioAlmoco = async(diaHoje: string, horario: string, usuarioCod: number) => {

        let relationalData: horasDTOP

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
            relationalData = response.data
        } catch (error){
            console.log(error)
            throw error
        }

        console.log(relationalData)


        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 2
            }]
        }

        console.log(data)


        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de almoço (entrada) criado com sucesso!')
            return response
        } catch (error){
            console.log('Ocorreu um erro ao criar o ponto de entrada!')
            throw error
        }

    }


    const baterSaidaAlmoco = async(diaHoje: string, horario: string, usuarioCod: number) => {

        let relationalData: horasDTOP

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
            relationalData = response.data
        } catch (error){
            console.log(error)
            throw error
        }

        console.log(relationalData)


        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 2
            }]
        }

        console.log(data)


        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de almoço (Saída) criado com sucesso!')
            return response
        } catch (error){
            console.log('Ocorreu um erro ao criar o ponto de entrada!')
            throw error
        }

    }


    const baterSaida = async(diaHoje: string, horario: string, usuarioCod: number) => {

        let relationalData: horasDTOP

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
            relationalData = response.data
        } catch (error){
            console.log(error)
            throw error
        }

        console.log(relationalData)


        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 1
            }]
        }

        console.log(data)


        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de saida criado com sucesso!', response)
        } catch (error){
            console.log('Ocorreu um erro ao criar o ponto de entrada!', error)
        }

        type pontos = {
            id: string,
            usuarioCod: number,
            horasCod: number,
            data: string,
            pontos: [
                { horarioPonto: string, tipoPonto: string }
            ]
        }

        let dataP: pontos

        try {
            const response = await Api.get(`/mpontos/porHorasCod/${relationalData.horasCod}`);
            dataP = response.data
        }  catch (error){
            console.log(error)
            throw error
        }

        let horaEntrada: number = 0, horaSaida: number = 0, horaIniIntervalo: number = 0, horaFimIntervalo: number = 0, almocoCount: number = 0

        dataP.pontos.map(item => {
            if (item.tipoPonto == "ENTRADA") {
                horaEntrada = timeStringToHours(item.horarioPonto);
            }
            else if (item.tipoPonto == "ALMOCO" && almocoCount == 0){
                horaIniIntervalo = timeStringToHours(item.horarioPonto);
                almocoCount += 1;
            }
            else if (item.tipoPonto == "ALMOCO" && almocoCount == 1){
                horaFimIntervalo = timeStringToHours(item.horarioPonto);
                almocoCount += 1;
            }
            else {
                horaSaida = timeStringToHours(item.horarioPonto);
            }
        })

        const envio: horasDTOP = {
            horasCod: relationalData.horasCod,
            horasExtras: 0,
            horasTrabalhadas: ((horaSaida - horaEntrada) - (horaFimIntervalo - horaIniIntervalo)),
            horasNoturnas: 0,
            horasFaltantes: 0,
            horasData: diaHoje,
            usuarioCod: usuarioCod
        }

        try{
            const a = await Api.put('horas/atualizar', envio);
            return a
        } catch (error) {
            throw error
        }

    }

    const verificarHoras = async(diaHoje: string, usuarioCod: number) => {
        let relationalData: horasDTOP

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`)
            relationalData = response.data
        } catch (error){
            console.log(error)
            throw error
        }

        console.log(relationalData)

        type pontos = {
            id: string,
            usuarioCod: number,
            horasCod: number,
            data: string,
            pontos: [
                { horarioPonto: string, tipoPonto: string }
            ]
        }

        let data: pontos

        try {
            const response = await Api.get(`/mpontos/porHorasCod/${relationalData.horasCod}`);
            data = response.data
        }  catch (error){
            console.log(error)
            throw error
        }

        // estado
        let estado: "initial" | "entrada" | "inicioIntervalo" | "fimIntervalo" | "saida" = "initial"
        const ponto = data.pontos
        let almocoCount = 0
        
        ponto.map(item => {
            if (item.tipoPonto == "ENTRADA") {
                estado = "entrada"
            }
            else if (item.tipoPonto == "ALMOCO" && almocoCount == 0){
                estado = "inicioIntervalo"
                almocoCount += 1;
            }
            else if (item.tipoPonto == "ALMOCO" && almocoCount == 1){
                estado = "fimIntervalo"
                almocoCount += 1;
            }
            else {
                estado = "saida"
            }

        })

        return estado
    }

    return { 
        createHoras, baterEntrada, baterInicioAlmoco, baterSaidaAlmoco, baterSaida, verificarHoras
    }

}