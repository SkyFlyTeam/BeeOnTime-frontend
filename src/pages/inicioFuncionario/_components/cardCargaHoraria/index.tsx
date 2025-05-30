// General  
import { useEffect, useState } from 'react';

// Services
import { horasServices } from '@/../src/services/horasServices';

// Interfaces
import { Usuario } from '@/../src/interfaces/usuario';
import  Horas  from '@/../src/interfaces/horas';
import  HistPontos  from '@/../src/interfaces/histPonto';

// Styles
import styles from './styles.module.css';
import { solicitacaoServices } from '@/services/solicitacaoServices';
import SolicitacaoInterface from '@/interfaces/Solicitacao';

interface CardCargaHorariaProps {
    usuarioInfo: Usuario;
    histPontos: HistPontos[];
}

const CardCargaHoraria = ({ usuarioInfo, histPontos }: CardCargaHorariaProps) => {
    const [pontoDia, setPontoDia] = useState<HistPontos | undefined>(undefined);
    const [horas, setHoras] = useState<Horas | undefined>(undefined);
    const [saidaPrevista, setSaidaPrevista] = useState<String | undefined>(undefined);
    const [solicitacaoExtra, setSolicitacaoExtra] = useState<SolicitacaoInterface | undefined>(undefined);

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

    let jornadaTotal;
    if(jornadaHorarioEntrada){
        jornadaTotal = (horaSaida - horaEntrada) + (minutoSaida - minutoEntrada) / 60;
    }else{
        jornadaTotal = usuarioInfo.usuario_cargaHoraria;
    }

    const horasTrabalhadas = horas ? horas.horasTrabalhadas : 0;
    const horasFaltantes = horas ? horas.horasFaltantes : 0;
    const horasExtras = horas ? horas.horasExtras : 0;

    const barraProgresso = Math.min((horasTrabalhadas / jornadaTotal) * 100, 100);

    const calcularSaidaPrevista = () => {
        if (!entrada || !horas) return ;  
    
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

    const fetchHoras = async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const data = `${year}-${month}-${day}`;

            const horas = await horasServices.getHorasByUsuarioAndDate(usuarioInfo.usuario_cod, data) as Horas;

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
        const pontoAtual = histPontos.filter((ponto) => ponto.data === data);
        setPontoDia(pontoAtual[0]);
    };

    const fetchSolicitacoes = async () => {
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = (today.getMonth() + 1).toString().padStart(2, '0');
            const day = today.getDate().toString().padStart(2, '0');
            const data = `${year}-${month}-${day}`;

            const solicitacoes = await solicitacaoServices.getAllSolicitacaoByUsuario(usuarioInfo.usuario_cod) as SolicitacaoInterface[];

            const solicitacaoExtraHoje = solicitacoes.find((solicitacao) => solicitacao.tipoSolicitacaoCod.tipoSolicitacaoCod == 5 && solicitacao.solicitacaoDataPeriodo == data);
            
            setSolicitacaoExtra(solicitacaoExtraHoje);
        } catch (error) {
            console.error("erro ao resgatar solicitações", error)
        }
    };

    useEffect(() => {
        fetchHoras();
        fetchSolicitacoes()
    }, []);

    useEffect(() => {
        let saidaPrevista = calcularSaidaPrevista();
        setSaidaPrevista(saidaPrevista)
    }, [histPontos, horas])

    return (
        <div className={styles.card_container}>
            <p className={styles.card_title}>Carga diária</p>
            <div className={styles.carga_horaria}>
                <span>Horas Trabalhadas: {horasTrabalhadas.toFixed(0)}h</span>
                <span>Horas Faltantes: {horasFaltantes.toFixed(0)}h</span>
            </div>
            <div className={styles.progress_bar_container}>
                <div className={styles.progress_bar} style={{ width: `${barraProgresso}%` }} />
            </div>
            <div className={styles.saida_prevista}>
                {(entrada && saidaPrevista) &&  <span>Saída prevista: {saidaPrevista}</span>}
            </div> 
                <div className={styles.jornada}>
                {!usuarioInfo.jornadas.jornada_horarioFlexivel &&
                    <span>Jornada de trabalho: {jornadaHorarioEntrada} às {jornadaHorarioSaida}</span>
                }
                    { horasExtras > 0 && !solicitacaoExtra ? (
                        <span>Horas extras: {horasExtras.toFixed(0)}h </span>
                    ) : (
                        solicitacaoExtra ? (<span>Horas extras planejadas: {solicitacaoExtra.horasSolicitadas}h </span>) : (null)
                    )}
                </div>
        </div>
    );
};

export default CardCargaHoraria;
