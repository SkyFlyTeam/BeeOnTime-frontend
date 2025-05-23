import { useEffect, useState } from 'react'
import { ApiException } from '../../config/apiExceptions'

// Interfaces
import SolicitacaoInterface from '../../interfaces/Solicitacao'

// Services
import { solicitacaoServices } from '../../services/solicitacaoServices'
import SolicitationCard from './SolicitacaoCard'
import styles from './Solicitacao.module.css'
import Tab from '../../components/custom/tab'
import Modal from '../../components/custom/modalSolicitacao/index'

import ModalDevolutiva from '../../components/custom/modalSolicitacao/modalDevolutiva'
import { getUsuario } from '../../services/authService'
import ModalAjustePonto from '@/components/custom/modalSolicitacao/modalAjustePonto'
import ModalDecisaoHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalHoraExtra'
import { renderModalChildren } from '../../utils/renderModalByTipoSolicitacao.tsx'
import ModalSolicitarHoraExtra from '@/components/custom/modalSolicitacao/modalHoraExtra/modalSolicitarHoraExtra'
import { pontoServices } from '@/services/pontoServices'
import MarcacaoPonto from '@/interfaces/marcacaoPonto'

import { Skeleton } from '@/components/ui/skeleton'
import SolicitacaoCardSkeleton from './SolicitacaoCard/cardSkeleton'

interface SolicitacoesState {
  all: SolicitacaoInterface[]
  pendentes: SolicitacaoInterface[]
  historico: SolicitacaoInterface[]
}

const Solicitacao = () => {
  // Modais
  const [openDevolutivaModal, setOpenDevolutivaModal] = useState<boolean>(false)
  const [isModalHoraExtraOpen, setIsModalHoraExtraOpen] = useState(false);
  const [openModal, setOpenModal] = useState<{
    [key: string]: boolean
  }>({})

  // Informações do usuário
  const [usuarioCod, setUsuarioCod] = useState<number>(0)
  const [usuarioCargo, setUsuarioCargo] = useState<string>('')
  const [nivelAcessoCod, setNivelAcessoCod] = useState<number>()
  const [setorCod, setSetorCod] = useState()
  const [cargaHoraria, setCargaHoraria] = useState<number>()

  const [toogle, setToogle] = useState(false)

  const [solicitacoesData, setSolicitacoesData] = useState<SolicitacoesState>({
    all: [],
    pendentes: [],
    historico: [],
  })

  // Paginação
  const [displayedSolicitacoes, setDisplayedSolicitacoes] = useState<SolicitacaoInterface[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalItems, setTotalItems] = useState(0)
  const [isLoading, setIsLoading] = useState(true);

  
  const fetchSolicitacoes = async (
    usuarioCargo: string,
    usuarioCod: number,
    nivelAcessoCod?: number,
    setorCod?: number
  ) => {
    setIsLoading(true)
    
    try {
      let result: unknown;
  
      if (nivelAcessoCod === 2 && usuarioCod) {
        result = await solicitacaoServices.getAllSolicitacaoByUsuario(usuarioCod)
      } else if (nivelAcessoCod === 1 && setorCod) {
        result = await solicitacaoServices.getAllSolicitacaoBySetor(setorCod)
      } else {
        result = await solicitacaoServices.getAllSolicitacao()
      }
  
      // Confirmação de tipo seguro
      if (!Array.isArray(result)) {
        throw new Error('Erro inesperado: formato de dados inválido.')
      }
  
      let solicitacoesFiltradas = result as SolicitacaoInterface[]
  
      if (usuarioCargo === 'Funcionário') {
        solicitacoesFiltradas = solicitacoesFiltradas.filter((s) => s.usuarioCod === usuarioCod)
      } else if (usuarioCargo === 'Gestor' || usuarioCargo === 'Admin') {
        solicitacoesFiltradas = solicitacoesFiltradas.filter(
          (s) => s.usuarioCod === usuarioCod || s.usuarioCargo === 'Funcionário'
        )
      }
  
      setSolicitacoesData({
        all: solicitacoesFiltradas.filter((s) => s.solicitacaoStatus !== 'PENDENTE'),
        pendentes: solicitacoesFiltradas.filter((s) => s.solicitacaoStatus === 'PENDENTE'),
        historico: solicitacoesFiltradas.filter((s) => s.solicitacaoStatus !== 'PENDENTE'),
      })
  
      setTotalItems(solicitacoesFiltradas.length)
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error)
      setSolicitacoesData({
        all: [],
        pendentes: [],
        historico: [],
      })
      setTotalItems(0)
    } finally {
      setIsLoading(false)
    }
  }
  

  const paginateData = () => {
    const dataToDisplay = toogle ? solicitacoesData.pendentes : solicitacoesData.historico
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    setDisplayedSolicitacoes(dataToDisplay.slice(startIndex, endIndex))
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
  }

  const handleModal = (solicitacaoCod: number, status: boolean) => {
    if (solicitacaoCod === 0) {
      setIsModalHoraExtraOpen(false)
      return
    }
    setOpenModal((prevState) => ({
      ...prevState,
      [solicitacaoCod]: status,
    }))

    if (status === true) {
      handleDevolutivaModal(false)
    }
  }

  const handleDevolutivaModal = (status: boolean) => {
    setOpenDevolutivaModal(status)
  }

  const handleClick = (status: string) => {
    setCurrentPage(1)

    setSolicitacoesData((prevState) => ({
      ...prevState,
      all: status == 'PENDENTES' ? prevState['pendentes'] : prevState['historico'],
    }))
    setToogle(status === 'PENDENTES')
  }

  // Atualizar lista
  const handleSolicitacaoUpdate = async (updatedSolicitacao: SolicitacaoInterface) => {
    setSolicitacoesData((prevData) => {
      const updatedPendentes = prevData.pendentes.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== updatedSolicitacao.solicitacaoCod
      )
      const updatedHistorico = prevData.historico.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== updatedSolicitacao.solicitacaoCod
      )

      if (updatedSolicitacao.solicitacaoStatus === 'PENDENTE') {
        updatedPendentes.push(updatedSolicitacao)
      } else {
        updatedHistorico.push(updatedSolicitacao)
      }
  

      // Aplique o filtro novamente para garantir que o cargo do usuário seja levado em consideração
      return {
        ...prevData,
        pendentes: updatedPendentes,
        historico: updatedHistorico,
      }
    })

    paginateData()
  }
  
  // Atualziar depois de uma exclusão
  const handleDeleteSolicitacao = (idToDelete: number) => {
    setSolicitacoesData((prevData) => {
      const updatedPendentes = prevData.pendentes.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== idToDelete
      )
      const updatedHistorico = prevData.historico.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== idToDelete
      )
      const updatedAll = prevData.all.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== idToDelete
      )
      return {
        ...prevData,
        pendentes: updatedPendentes,
        historico: updatedHistorico,
        all: updatedAll,
      }
    })

    setDisplayedSolicitacoes((prev) =>
      prev.filter((solicitacao) => solicitacao.solicitacaoCod !== idToDelete)
    )
  }

  

  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await getUsuario()
        if (!response || !response.data) {
          console.error('Usuário não encontrado.')
          return
        }
  
        const { usuario_cod, usuario_cargo, nivelAcesso_cod, setorCod, usuario_cargaHoraria} = response.data
        setUsuarioCod(usuario_cod)
        setUsuarioCargo(usuario_cargo)
        setNivelAcessoCod(nivelAcesso_cod)
        setSetorCod(setorCod)
        setCargaHoraria(usuario_cargaHoraria)

        await fetchSolicitacoes(usuario_cargo, usuario_cod, nivelAcesso_cod, setorCod)
      } catch (error) {
        console.error('Erro ao obter usuário:', error)
      }
    }

    initialize()
    }, [usuarioCod, usuarioCargo, nivelAcessoCod, setorCod])  
    
    useEffect(() => {
      paginateData()  
    }, [currentPage, solicitacoesData, toogle])
  

  const totalPages = Math.ceil(
    (toogle ? solicitacoesData.pendentes.length : solicitacoesData.historico.length) / itemsPerPage
  )

  if (isLoading) {
    return (
      <div className={styles.solicitacao_container}>
      <div className={styles.card_container}>
        <h1 className='font-bold text-4xl'>Solicitações</h1>

        <div className=' flex items-center justify-center mt-7'>
          <Skeleton className='h-12 w-[16rem] bg-gray-200 ' />
        </div>

        {/* Tab e estrutura já visíveis, com skeletons abaixo */}
        <div className={styles.container}>
          {Array.from({ length: 5 }).map((_, index) => (
            <SolicitacaoCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </div>
    )
  }

    return (
      <div className={styles.solicitacao_container}>
      <div className={styles.card_container}>
        <h1 className='font-bold text-4xl self-start'>Solicitações</h1>

        <Tab
          activeTab={toogle ? 'PENDENTES' : 'HISTÓRICO'}
          onClick={handleClick}
          tabLabels={['PENDENTES', 'HISTÓRICO']}  
          pendentesLength={solicitacoesData.pendentes.length}
          showBadge={true}  
        />

        <div className={styles.container}>
          {displayedSolicitacoes.length > 0 ? (
            displayedSolicitacoes.map((solicitacao) => (
              <div key={solicitacao.solicitacaoCod}>
                <SolicitationCard
                  solicitacao={solicitacao}
                  onClick={() => handleModal(solicitacao.solicitacaoCod, true)}
                  onSolicitacaoUpdate={handleSolicitacaoUpdate}
                  usuarioCargo={solicitacao.usuarioCargo}
                  usuarioCod={solicitacao.usuarioCod}
                  usuarioLogadoCargo={usuarioCargo}
                  usuarioLogadoCod={usuarioCod}
                  onDelete={handleDeleteSolicitacao}
                />

                <Modal
                  isOpen={openModal[solicitacao.solicitacaoCod]}
                  onClick={() => handleModal(solicitacao.solicitacaoCod, false)}
                  children={renderModalChildren({
                    solicitacao,
                    onSolicitacaoUpdate: handleSolicitacaoUpdate,
                    onClose: () => handleModal(solicitacao.solicitacaoCod, false),
                    usuarioLogadoCod: usuarioCod,
                    usuarioCargo: usuarioCargo,
                    nivelAcessoCod: nivelAcessoCod,
                    cargaHoraria: cargaHoraria
                  })
                  } 
                  title={solicitacao.tipoSolicitacaoCod.tipoSolicitacaoNome}                  
                />
              </div>
            ))
          ) : (
            <div className={styles.no_content}>
              <img src="/images/sem_conteudo.svg" alt="" />
              <p>Ops! Parece que não tem nada aqui!</p>
            </div>
          )}

          {displayedSolicitacoes.length > 0 && totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  )
                } else if (Math.abs(page - currentPage) === 2 && page < currentPage) {
                  return <span key={`left-ellipsis`} className={styles.ellipsis}>...</span>
                } else if (Math.abs(page - currentPage) === 2 && page > currentPage) {
                  return <span key={`right-ellipsis`} className={styles.ellipsis}>...</span>
                }

                return null
              })}

              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========= Modais de solicitações ========= */}

      {/* Hora extra */}
      <Modal 
        isOpen={isModalHoraExtraOpen}  
        onClick={() => handleModal(0, false)} 
        children={
          <ModalSolicitarHoraExtra 
            usuarioCod={usuarioCod} 
            cargaHoraria={cargaHoraria ? cargaHoraria : 0}
            onClose={() => setIsModalHoraExtraOpen(false)}
            onSolicitacaoUpdate={handleSolicitacaoUpdate}
          /> } 
        title={'Hora extra'}      
      />
    </div>
  )
}

export default Solicitacao
