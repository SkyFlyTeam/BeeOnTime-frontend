// General  
import { useEffect, useState } from 'react';

// Services
import { horasServices } from '../../../services/horasService';

// Interfaces
import { Usuario } from '@/../src/interfaces/usuario';
import  Horas  from '@/../src/interfaces/horas';
import  HistPontos  from '@/../src/interfaces/histPonto';

// Styles
import styles from './styles.module.css';

interface CardCargaHorariaProps {
    usuarioInfo: Usuario;
    histPontos: HistPontos[];
}

const CardCargaHoraria = ({ usuarioInfo, histPontos }: CardCargaHorariaProps) => {
    const [pontoDia, setPontoDia] = useState<HistPontos | undefined>(undefined);
    const [horas, setHoras] = useState<Horas | undefined>(undefined);

    const formatTime = (time: string | Date): string => {
        if (typeof time === 'string') {
            time = time.slice(0, 5)
            return time;
        }

        if (time instanceof Date) {
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        return '';
    };


    const jornadaHorarioEntrada = formatTime(usuarioInfo.jornadas.jornada_horarioEntrada);
    const jornadaHorarioSaida = formatTime(usuarioInfo.jornadas.jornada_horarioSaida);
  
    console.log('horessss', pontoDia)
    const entrada = horas
        ? pontoDia?.pontos.filter((ponto) => ponto.tipoPonto === 0).map((ponto) => ponto.horarioPonto)[0]
        : null;

    let horaEntrada = 0;
    let minutoEntrada = 0;

    if (typeof entrada === 'string') {
        [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
    } else if (entrada instanceof Date) {
        horaEntrada = entrada.getHours();
        minutoEntrada = entrada.getMinutes();
    }

    const [horaSaida, minutoSaida] = jornadaHorarioSaida.split(":").map(Number);

    const jornadaTotal = (horaSaida - horaEntrada) + (minutoSaida - minutoEntrada) / 60;

    const horasTrabalhadas = horas ? horas.horasTrabalhadas : 0;
    const horasFaltantes = horas ? horas.horasFaltantes : 0;
    const horasExtras = horas ? horas.horasExtras : 0;

    const barraProgresso = Math.min((horasTrabalhadas / jornadaTotal) * 100, 100);

    const calcularSaidaPrevista = () => {
        console.log('entrada', entrada)
        console.log('horas', horas)
        if (!entrada || !horas) return '00:00';  
    
        let horaEntrada = 0;
        let minutoEntrada = 0;
    
        if (typeof entrada === 'string') {
            [horaEntrada, minutoEntrada] = entrada.split(':').map(Number);
        } else if (entrada instanceof Date) {
            horaEntrada = entrada.getHours();
            minutoEntrada = entrada.getMinutes();
        }
    
        const entradaDate = new Date();
        entradaDate.setHours(horaEntrada, minutoEntrada, 0, 0);
    
        const horasAdicionais = usuarioInfo.usuario_cargaHoraria;
        entradaDate.setHours(entradaDate.getHours() + horasAdicionais);
    
        const saidaHora = entradaDate.getHours().toString().padStart(2, '0');
        const saidaMinuto = entradaDate.getMinutes().toString().padStart(2, '0');
        
        return `${saidaHora}:${saidaMinuto}`;
    };

    const saidaPrevista = calcularSaidaPrevista();

    const fetchHoras = async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const data = `${year}-${month}-${day}`;

            const horas = await horasServices.getHorasByUsuarioAndDate(usuarioInfo.usuario_cod, data);

            console.log('HORASSSS', horas)

            if (!horas) {
                setHoras({
                    horasCod: 0,
                    horasNoturnas: 0,
                    horasTrabalhadas: 0,
                    horasExtras: 0,
                    horasFaltantes: 0,
                    horasData: data,
                    usuarioCod: usuarioInfo.usuario_cod,
                });
                return;
            }

            setHoras(horas as Horas);
            fetchDia(data);
        } catch (error) {
            setHoras({
                horasCod: 0,
                horasNoturnas: 0,
                horasTrabalhadas: 0,
                horasExtras: 0,
                horasFaltantes: 0,
                horasData: new Date(),
                usuarioCod: usuarioInfo.usuario_cod
            });
        }
    };

    const fetchDia = (data: string) => {
        console.log('hist pontos do carddddd', histPontos)
        const pontoAtual = histPontos.filter((ponto) => ponto.data === data);
        setPontoDia(pontoAtual[0]);
    };

    useEffect(() => {
        fetchHoras();
    }, []);

    return (
        <div className={styles.card_container}>
            <p className={styles.card_title}>Carga diária</p>
            <div className={styles.carga_horaria}>
                <span>Horas Trabalhadas: {horasTrabalhadas}h</span>
                <span>Horas Faltantes: {horasFaltantes}h</span>
            </div>
            <div className={styles.progress_bar_container}>
                <div className={styles.progress_bar} style={{ width: `${barraProgresso}%` }} />
            </div>
            <div className={styles.saida_prevista}>
                <span>Saída prevista: {saidaPrevista}</span>
            </div>
            <div className={styles.jornada}>
                <span>Jornada de trabalho: {jornadaHorarioEntrada} às {jornadaHorarioSaida}</span>
                { horasExtras > 0 && (
                    <span>Horas extras: {horasExtras}h</span>
                )}
            </div>
        </div>
    );
};

export default CardCargaHoraria;
