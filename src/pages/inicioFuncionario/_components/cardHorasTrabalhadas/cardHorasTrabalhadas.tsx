// Geral
import { useEffect, useState } from 'react'

// Serviços
import { horasServices } from '@/services/horasServices'
import { bancoHorasServices } from '@/services/bancoHorasService'

// Utils
import { calculateUserCargaMensal } from '@/utils/functions/calculateUserCargaMensal'

// Interfaces
import { Usuario } from '@/interfaces/usuario'
import Horas from '@/interfaces/horas'
import HistPontos from '@/interfaces/histPonto'
import { BancoHoras } from '@/interfaces/bancoHoras'
import { extrasPagasServices } from '@/services/extraPagaService'
import ExtrasPagas from '@/interfaces/extraPaga'

interface CardHorasTrabalhadasProps {
  usuarioInfo: Usuario | null
  histPontos: HistPontos[] | null
}

const CardHorasTrabalhadas = ({ usuarioInfo, histPontos }: CardHorasTrabalhadasProps) => {
  const [horasMensais, setHorasMensais] = useState<Horas[]>([])
  const [totalHorasTrabalhadas, setTotalHorasTrabalhadas] = useState<number>(0)
  const [bancoHoras, setBancoHoras] = useState<number>(0)
  const [horasExtrasPagas, setHorasExtrasPagas] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [hasData, setHasData] = useState<boolean>(false)
  const [cargaHorariaMensal, setCargaHorariaMensal] = useState<number>(0)

  // Verificação básica
  if (!usuarioInfo || !histPontos) {
    return (
      <div className="flex flex-col justify-between bg-white shadow-md p-6 rounded-xl flex-[3] min-w-fit">
        <p>Informações de usuário ou pontos não carregadas.</p>
      </div>
    )
  }

  const fetchHorasMensais = async () => {
    try {
      setIsLoading(true)

      const today = new Date()
      const dataReferencia = today.toISOString().split('T')[0] // yyyy-mm-dd

      // 1. Buscar carga horária mensal correta
      const cargaMensal = calculateUserCargaMensal(usuarioInfo)
      setCargaHorariaMensal(cargaMensal)

      // 2. Buscar saldo de banco de horas (e horas extras pagas)
      const saldoBancoHorasResponse = await bancoHorasServices.getBancoHorasSaldoAtual(usuarioInfo.usuario_cod, dataReferencia)
      const saldoBancoHoras = saldoBancoHorasResponse as BancoHoras
      const extrasPagasResponse = await extrasPagasServices.getExtrasPagasSaldoAtual(usuarioInfo.usuario_cod, dataReferencia)
      const extrasPagas = extrasPagasResponse as ExtrasPagas
      if (!('status' in saldoBancoHoras)) {
        setBancoHoras(saldoBancoHoras.bancoHorasSaldoAtual || 0)
        setHorasExtrasPagas(extrasPagas.extrasPagasSaldoAtual || 0)
      } else {
        console.warn('Erro ao buscar saldo banco horas:', saldoBancoHoras.status)
      }

      // 3. Buscar as horas trabalhadas de cada dia do mês
      const year = today.getFullYear()
      const month = today.getMonth()
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      const horasArray: Horas[] = []

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const formattedDate = date.toISOString().split('T')[0]

        try {
          const horas = await horasServices.getHorasByUsuarioAndDate(usuarioInfo.usuario_cod, formattedDate)

          if (!horas || ('status' in horas)) {
            horasArray.push({
              horasCod: 0,
              horasNoturnas: 0,
              horasTrabalhadas: 0,
              horasExtras: 0,
              horasFaltantes: 0,
              horasData: formattedDate,
              usuarioCod: usuarioInfo.usuario_cod,
            })
          } else {
            horasArray.push(horas as Horas)
          }
        } catch (error) {
          console.error(`Erro ao buscar horas para ${formattedDate}:`, error)
        }
      }

      setHorasMensais(horasArray)

      // 4. Somar as horas trabalhadas
      const totalHoras = horasArray.reduce((acc, dia) => acc + (dia.horasTrabalhadas || 0), 0)
      setTotalHorasTrabalhadas(totalHoras)

      setHasData(totalHoras > 0 || bancoHoras > 0 || horasExtrasPagas > 0)
    } catch (error) {
      console.error('Erro geral no CardHorasTrabalhadas:', error)
      setHorasMensais([])
      setTotalHorasTrabalhadas(0)
      setBancoHoras(0)
      setHorasExtrasPagas(0)
      setHasData(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (usuarioInfo && histPontos) {
      fetchHorasMensais()
    }
  }, [usuarioInfo, histPontos])

  const progressoHorasTrabalhadas = cargaHorariaMensal > 0
    ? Math.min((totalHorasTrabalhadas / cargaHorariaMensal) * 100, 100)
    : 0

  const progressoBancoHoras = (bancoHoras + horasExtrasPagas) > 0
    ? (bancoHoras / (bancoHoras + horasExtrasPagas)) * 100
    : 0

  // if (isLoading) {
  //   return (
  //     <div className="flex flex-col justify-between bg-white shadow-md p-6 rounded-xl flex-[3] min-w-fit">
  //       <p>Carregando informações...</p>
  //     </div>
  //   )
  // }

  return (
    <div className="flex flex-col justify-between bg-white shadow-md p-6 rounded-xl w-[768px] min-w-fit max-[565px]:w-[90%]">
      <div className="relative flex items-center">
        <p className="w-full text-center font-bold text-xl">Mensal</p>
        <select className="absolute right-0 border-none bg-transparent text-sm font-semibold text-gray-400">
          <option>Este mês</option>
        </select>
      </div>

      {/* Horas trabalhadas */}
      <div className="flex justify-between mt-3">
        <span>Horas Trabalhadas</span>
        <span className="text-right text-gray-400">{cargaHorariaMensal}h totais</span>
      </div>
      <div className="w-full h-[10px] bg-gray-200 rounded overflow-hidden mt-4">
        <div
          className="h-full bg-yellow-400 rounded transition-all duration-300"
          style={{ width: `${progressoHorasTrabalhadas}%` }}
        />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-gray-400">{totalHorasTrabalhadas.toFixed(0)}h</span>
      </div>

      {/* Banco de horas e horas pagas */}
      {(bancoHoras > 0 || horasExtrasPagas > 0) && (
        <>
          <div className="flex justify-between mt-4">
            <span className="text-gray-400">Banco de horas</span>
            <span className="text-gray-400">Horas extras pagas</span>
          </div>
          <div className="w-full h-[10px] bg-gray-200 rounded overflow-hidden mt-2">
            <div
              className="h-full bg-yellow-400 rounded transition-all duration-300"
              style={{ width: `${progressoBancoHoras}%` }}
            />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-gray-400">{bancoHoras.toFixed(0)}h</span>
            <span className="text-gray-400">{horasExtrasPagas.toFixed(0)}h</span>
          </div>
        </>
      )}
    </div>
  )
}

export default CardHorasTrabalhadas
