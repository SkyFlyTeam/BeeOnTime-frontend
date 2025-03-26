import styles from './styles.module.css';

interface CargaHoraria {
    horasTrabalhadas: number;
    horasExtra: number;
    horasFaltantes: number;
    jornadaHorarioEntrada: string | Date; 
    jornadaHorarioSaida: string | Date;
    saidaPrevista: string | Date; 
}

const CardCargaHoraria = (cargaHoraria: CargaHoraria ) => {
    const formatTime = (time: string | Date): string => {
        if (typeof time === 'string') {
            return time; 
        }

        if (time instanceof Date) {
            const hours = time.getHours().toString().padStart(2, '0');
            const minutes = time.getMinutes().toString().padStart(2, '0');
            return `${hours}:${minutes}`;
        }

        return ''; 
    };

    const jornadaHorarioEntrada = formatTime(cargaHoraria.jornadaHorarioEntrada);
    const jornadaHorarioSaida = formatTime(cargaHoraria.jornadaHorarioSaida);
    const saidaPrevista = formatTime(cargaHoraria.saidaPrevista);

    const [horaEntrada, minutoEntrada] = jornadaHorarioEntrada.split(":").map(Number);
    const [horaSaida, minutoSaida] = jornadaHorarioSaida.split(":").map(Number);

    const jornadaTotal = (horaSaida - horaEntrada) + (minutoSaida - minutoEntrada) / 60;
    const horasTrabalhadas = cargaHoraria.horasTrabalhadas;

    const barraProgresso = Math.min((horasTrabalhadas / jornadaTotal) * 100, 100);

    return (
        <div className={styles.card_container}>
            <p className={styles.card_title}>Carga diária</p>
            <div className={styles.carga_horaria}>
                <span>Horas Trabalhadas: {cargaHoraria.horasTrabalhadas}h</span>
                <span>Horas Faltantes: {cargaHoraria.horasFaltantes}h</span>
            </div>
            <div className={styles.progress_bar_container}>
                <div 
                    className={styles.progress_bar} 
                    style={{ width: `${barraProgresso}%` }}
                />
            </div>
            <div className={styles.saida_prevista}>
                <span>Saída prevista: {saidaPrevista}</span>
            </div>
            <div className={styles.jornada}>
                <span>Jornada de trabalho: {jornadaHorarioEntrada} às {jornadaHorarioSaida}</span>
                {cargaHoraria.horasExtra > 0 && (
                    <span>Horas extras: {cargaHoraria.horasExtra}h</span>
                )}
            </div>
        </div>
    );
};

export default CardCargaHoraria;
