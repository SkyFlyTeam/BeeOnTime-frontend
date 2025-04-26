// Geral
import { useEffect, useState } from 'react';

// Serviços
import { horasServices } from '@/../src/services/horasServices';

// Interfaces
import { Usuario } from '@/../src/interfaces/usuario';
import Horas from '@/../src/interfaces/horas';
import HistPontos from '@/../src/interfaces/histPonto';

interface CardHorasTrabalhadasProps {
  usuarioInfo: Usuario | null;
  histPontos: HistPontos[] | null;
}

const CardHorasTrabalhadas = ({ usuarioInfo, histPontos }: CardHorasTrabalhadasProps) => {
  const [horasMensais, setHorasMensais] = useState<Horas[]>([]);
  const [totalHorasTrabalhadas, setTotalHorasTrabalhadas] = useState<number>(0);
  const [horasExtrasTotais, setHorasExtrasTotais] = useState<number>(0);
  const [bancoHoras, setBancoHoras] = useState<number>(0);
  const [horasExtrasPagas, setHorasExtrasPagas] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [hasData, setHasData] = useState<boolean>(false);

  // Verificações para valores nulos
  if (!usuarioInfo) {
    return (
      <div className="flex flex-col justify-between bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] p-6 rounded-xl flex-[3] min-w-fit">
        <p>Usuário não encontrado</p>
      </div>
    );
  }

  if (!histPontos) {
    return (
      <div className="flex flex-col justify-between bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] p-6 rounded-xl flex-[3] min-w-fit">
        <p>Histórico de pontos não encontrado</p>
      </div>
    );
  }

  // Calcular a carga horária mensal esperada
  const diasTrabalhadosPorSemana = 5; // Padrão de 5 dias
  const semanasNoMes = 4.33; // Aproximação (30.42 dias / 7)
  const cargaHorariaDiaria = usuarioInfo.usuario_cargaHoraria || 8; // Padrão de 8h
  const cargaHorariaMensal = Math.round(cargaHorariaDiaria * diasTrabalhadosPorSemana * semanasNoMes);

  const fetchHorasMensais = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const year = today.getFullYear();
      const month = (today.getMonth() + 1).toString().padStart(2, '0');
      const daysInMonth = new Date(year, today.getMonth() + 1, 0).getDate();
      const horasArray: Horas[] = [];

      for (let day = 1; day <= daysInMonth; day++) {
        const dayStr = day.toString().padStart(2, '0');
        const date = `${year}-${month}-${dayStr}`;
        let horas;

        try {
          horas = await horasServices.getHorasByUsuarioAndDate(usuarioInfo.usuario_cod, date);
          console.log(`Horas para ${date}:`, horas); // Log para depuração
        } catch (error) {
          console.error(`Erro ao buscar horas para ${date}:`, error);
          horasArray.push({
            horasCod: 0,
            horasNoturnas: 0,
            horasTrabalhadas: 0,
            horasExtras: 0,
            horasFaltantes: 0,
            horasData: date,
            usuarioCod: usuarioInfo.usuario_cod,
          });
          continue;
        }

        if (horas && typeof horas === 'object' && 'status' in horas) {
          console.warn(`ApiException para ${date}:`, horas);
          horasArray.push({
            horasCod: 0,
            horasNoturnas: 0,
            horasTrabalhadas: 0,
            horasExtras: 0,
            horasFaltantes: 0,
            horasData: date,
            usuarioCod: usuarioInfo.usuario_cod,
          });
          continue;
        }

        if (!horas) {
          console.warn(`Nenhuma hora retornada para ${date}`);
          horasArray.push({
            horasCod: 0,
            horasNoturnas: 0,
            horasTrabalhadas: 0,
            horasExtras: 0,
            horasFaltantes: 0,
            horasData: date,
            usuarioCod: usuarioInfo.usuario_cod,
          });
          continue;
        }

        horasArray.push(horas as Horas);
      }

      setHorasMensais(horasArray);

      // Garantir que horasTrabalhadas e horasExtras sejam números antes de somar
      const totalHoras = horasArray.reduce((acc, dia) => {
        const horasTrabalhadas = Number(dia.horasTrabalhadas) || 0;
        return acc + horasTrabalhadas;
      }, 0);
      const totalExtras = horasArray.reduce((acc, dia) => {
        const horasExtras = Number(dia.horasExtras) || 0;
        return acc + horasExtras;
      }, 0);

      console.log('Total de horas trabalhadas:', totalHoras); // Log para depuração
      console.log('Total de horas extras:', totalExtras); // Log para depuração

      setTotalHorasTrabalhadas(totalHoras);
      setHorasExtrasTotais(totalExtras);

      // Verificar se há dados significativos
      setHasData(totalHoras > 0 || totalExtras > 0);

      // Calcular bancoHoras e horasExtrasPagas com base em horasExtrasTotais
      if (totalExtras > 0) {
        const bancoProportion = 7 / 10;
        const pagasProportion = 3 / 10;
        setBancoHoras(Math.round(totalExtras * bancoProportion));
        setHorasExtrasPagas(Math.round(totalExtras * pagasProportion));
      } else {
        setBancoHoras(0);
        setHorasExtrasPagas(0);
      }
    } catch (error) {
      console.error('Erro ao buscar horas mensais:', error);
      setHorasMensais([]);
      setTotalHorasTrabalhadas(0);
      setHorasExtrasTotais(0);
      setBancoHoras(0);
      setHorasExtrasPagas(0);
      setHasData(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHorasMensais();
  }, [usuarioInfo, histPontos]);

  // Calcular o progresso da barra de horas trabalhadas
  const progressoHorasTrabalhadas = cargaHorariaMensal > 0
    ? Math.min((totalHorasTrabalhadas / cargaHorariaMensal) * 100, 100)
    : 0;
  const progressoBancoHoras = horasExtrasTotais > 0
    ? (bancoHoras / horasExtrasTotais) * 100
    : 0;

//   if (isLoading) {
//     return (
//       <div className="flex flex-col justify-between bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] p-6 rounded-xl flex-[3] min-w-fit">
//         <p>Carregando...</p>
//       </div>
//     );
//   }

//   if (!hasData) {
//     return (
//       <div className="flex flex-col justify-between bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] p-6 rounded-xl flex-[3] min-w-fit">
//         <p>Nenhum dado encontrado para este mês.</p>
//       </div>
//     );
//   }

  return (
    <div className="flex flex-col justify-between bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] p-6  rounded-xl w-[768px]  min-w-fit max-[565px]:w-[90%] max-[565px]:text-sm max-[435px]:w-[90%] max-[435px]:text-sm"> {/* flex-[2] trocar pelo w-[768px] quando colocar outro card*/}
      <div className="relative flex items-center ">
        <p className="w-full text-center font-bold text-xl mb-0">Mensal</p>
        <select className="absolute right-0 border-none bg-transparent text-sm font-semibold text-gray-400">
          <option>Este mês</option>
        </select>
      </div>

      <div className="flex justify-between max-[435px]:gap-32 max-[395px]:gap-16 max-[340px]:gap-8 mt-3">
        <span>Horas Trabalhadas</span>
        <span className="text-right" style={{ color: '#00000059' }}>
          {cargaHorariaMensal}h totais
        </span>
      </div>
      <div className="w-full h-[10px] bg-[var(--gray-light)] rounded overflow-hidden mt-4">
        <div
          className="h-full bg-[var(--yellow)] rounded transition-[width] duration-300 ease-in"
          style={{ width: `${progressoHorasTrabalhadas}%` }}
        />
      </div>
      <div className="flex justify-between max-[435px]:gap-32 max-[395px]:gap-16 max-[340px]:gap-8 mt-1">
        <span style={{ color: '#00000059' }}>{totalHorasTrabalhadas}h</span> {/* para a pessoa estar informada de quantas horas ela já possui  */}
        <span></span> {/* Span vazio para consistência de layout */}
      </div>

      {horasExtrasTotais > 0 && (
        <>
          <div className="flex justify-between max-[435px]:gap-32 max-[395px]:gap-16 max-[340px]:gap-8 mt-3">
            <span style={{ color: '#00000059' }}>Banco de horas</span>
            <span className="text-right" style={{ color: '#00000059' }}>
              Horas extras pagas
            </span>
          </div>
          <div className="w-full h-[10px] bg-[var(--gray-light)] rounded overflow-hidden mt-4">
            <div
              className="h-full bg-[var(--yellow)] rounded transition-[width] duration-300 ease-in"
              style={{ width: `${progressoBancoHoras}%` }}
            />
          </div>
          <div className="flex justify-between max-[435px]:gap-32 max-[395px]:gap-16 max-[340px]:gap-8 mt-1">
            <span style={{ color: '#00000059' }}>{bancoHoras}h</span>
            <span className="text-right" style={{ color: '#00000059' }}>{horasExtrasPagas}h</span>
          </div>
        </>
      )}
    </div>
  );
};

export default CardHorasTrabalhadas;