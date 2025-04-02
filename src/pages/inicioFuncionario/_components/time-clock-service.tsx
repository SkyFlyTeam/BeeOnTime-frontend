import { Api } from "@/config/apiHorasConfig";

interface horasDTO {
    horasExtras: number;
    horasTrabalhadas: number;
    horasNoturnas: number;
    horasFaltantes: number;
    horasData: string;
    usuarioCod: number;
}

interface horasDTOP {
    horasExtras: number;
    horasTrabalhadas: number;
    horasNoturnas: number;
    horasFaltantes: number;
    horasData: string;
    usuarioCod: number;
    horasCod: number;
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
    const createHoras = async (data: horasDTO, diaHoje: string, usuarioCod: number) => {
        let relationalData: horasDTO | null;

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTO;  // Type Assertion
        } catch (error) {
            relationalData = null;
            console.log(error);
        }

        if (!relationalData) {
            try {
                const response = await Api.post('/horas/cadastrar', data);
                console.log('dataRelacional criada com sucesso!');
                return response;
            } catch (error) {
                console.log(error);
                throw error;
            }
        } else {
            console.log('dataRelacional já criada!');
        }
    }

    const baterEntrada = async (diaHoje: string, horario: string, usuarioCod: number) => {
        let relationalData: horasDTOP;

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTOP;  // Type Assertion
        } catch (error) {
            console.log(error);
            throw error;
        }

        console.log(relationalData);

        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 0
            }]
        };

        console.log(data);

        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de entrada criado com sucesso!');
            return response;
        } catch (error) {
            console.log('Ocorreu um erro ao criar o ponto de entrada!');
            throw error;
        }
    }

    const baterInicioAlmoco = async (diaHoje: string, horario: string, usuarioCod: number) => {
        let relationalData: horasDTOP;

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTOP;  // Type Assertion
        } catch (error) {
            console.log(error);
            throw error;
        }

        console.log(relationalData);

        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 2
            }]
        };

        console.log(data);

        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de almoço (entrada) criado com sucesso!');
            return response;
        } catch (error) {
            console.log('Ocorreu um erro ao criar o ponto de entrada!');
            throw error;
        }
    }

    const baterSaidaAlmoco = async (diaHoje: string, horario: string, usuarioCod: number) => {
        let relationalData: horasDTOP;

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTOP;  // Type Assertion
        } catch (error) {
            console.log(error);
            throw error;
        }

        console.log(relationalData);

        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 2
            }]
        };

        console.log(data);

        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de almoço (Saída) criado com sucesso!');
            return response;
        } catch (error) {
            console.log('Ocorreu um erro ao criar o ponto de entrada!');
            throw error;
        }
    }

    const baterSaida = async (diaHoje: string, horario: string, usuarioCod: number) => {
        let relationalData: horasDTOP;

        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTOP;  // Type Assertion
        } catch (error) {
            console.log(error);
            throw error;
        }

        console.log(relationalData);

        const data = {
            usuarioCod: usuarioCod,
            horasCod: relationalData.horasCod,
            pontos: [{
                horario: horario, tipo: 1
            }]
        };

        console.log(data);

        try {
            const response = Api.post('/mpontos/baterPonto', data);
            console.log('Ponto de saida criado com sucesso!', response);
            return response;
        } catch (error) {
            console.log('Ocorreu um erro ao criar o ponto de entrada!', error);
            throw error;
        }
    }

    const verificarHoras = async (diaHoje: string, usuarioCod: number) => {
        let relationalData: horasDTOP;
    
        try {
            const response = await Api.post(`/horas/usuario/${usuarioCod}/dia?data=${diaHoje}`);
            relationalData = response.data as horasDTOP;  // Type Assertion
        } catch (error) {
            console.log(error);
            throw error;
        }
    
        console.log(relationalData);
    
        type pontos = {
            id: string;
            usuarioCod: number;
            horasCod: number;
            data: string;
            pontos: [
                { horarioPonto: string, tipoPonto: string | number }
            ]
        }
    
        let data: pontos;
    
        try {
            const response = await Api.get(`/mpontos/porHorasCod/${relationalData.horasCod}`);
            data = response.data as pontos;  // Type Assertion to ensure the correct type
        } catch (error) {
            console.log(error);
            throw error;
        }
    
        // estado
        let estado: "initial" | "entrada" | "inicioIntervalo" | "fimIntervalo" | "saida" = "initial";
        const ponto = data.pontos;
        let almocoCount = 0;
    
        ponto.map(item => {
            if (item.tipoPonto == "ENTRADA" || item.tipoPonto == 0) {
                estado = "entrada";
            } else if ((item.tipoPonto == "ALMOCO" || item.tipoPonto == 2) && almocoCount == 0) {
                estado = "inicioIntervalo";
                almocoCount += 1;
            } else if ((item.tipoPonto == "ALMOCO" || item.tipoPonto == 2) && almocoCount == 1) {
                estado = "fimIntervalo";
                almocoCount += 1;
            } else if (item.tipoPonto == "SAIDA" || item.tipoPonto == 1) {
                estado = "saida";
            } else {
                estado = 'initial';
            }
        });
    
        return estado;
    }

    return { 
        createHoras, baterEntrada, baterInicioAlmoco, baterSaidaAlmoco, baterSaida, verificarHoras 
    }
}
