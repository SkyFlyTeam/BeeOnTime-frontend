// General
import { useEffect, useState } from 'react'

// Config
import { ApiException } from '../../config/apiExceptions'

// Interfaces
import Solicitacao from '../../interfaces/solicitacao'

// Services
import { solicitacaoServices } from '../../services/solicitacaoServices'
import { getUsuario } from '../../services/authService'

// Components
import SolicitationCard from './SolicitacaoCard'
import Tab from '../../components/custom/tab'
import Modal from '../../components/custom/modalSolicitacao'
import ModalDevolutiva from '../../components/custom/modalSolicitacao/modalDevolutiva'

// Styles
import styles from './Solicitacao.module.css'


interface SolicitacoesState {
  all: Solicitacao[]
  pendentes: Solicitacao[]
  historico: Solicitacao[]
}

const SolicitacaoPage = () => {
  const [openDevolutivaModal, setOpenDevolutivaModal] = useState<boolean>(false)
  const [usuarioCod, setUsuarioCod] = useState<number>(0)
  const [usuarioCargo, setUsuarioCargo] = useState<string>('')

  const [toogle, setToogle] = useState(false)

  const [solicitacoesData, setSolicitacoesData] = useState<SolicitacoesState>({
    all: [],
    pendentes: [],
    historico: [],
  })

  const [displayedSolicitacoes, setDisplayedSolicitacoes] = useState<Solicitacao[]>([])

  const [openModal, setOpenModal] = useState<{
    [key: string]: boolean
  }>({})

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalItems, setTotalItems] = useState(0)

  const fetchSolicitacoes = async (usuarioCargo: string, usuarioCod: number) => {
    const result = await solicitacaoServices.getAllSolicitacao()
  
    if (result instanceof ApiException) {
      setSolicitacoesData({
        all: [],
        pendentes: [],
        historico: [],
      })
      setTotalItems(0)
    } else {
      let filteredSolicitacoes = result
  
      // Aplica o filtro com base no cargo do usuário
      if (usuarioCargo === 'Funcionário') {
        filteredSolicitacoes = result.filter((s) => s.usuarioCod === usuarioCod)
      } else if (usuarioCargo === 'Gestor' || usuarioCargo === 'Admin') {
        filteredSolicitacoes = result.filter(
          (s) => s.usuarioCod === usuarioCod || s.usuarioCargo === 'Funcionário'
        )
      }
  
      setSolicitacoesData({
        all: filteredSolicitacoes.filter((s) => s.solicitacaoStatus !== 'PENDENTE'),
        pendentes: filteredSolicitacoes.filter((s) => s.solicitacaoStatus === 'PENDENTE'),
        historico: filteredSolicitacoes.filter((s) => s.solicitacaoStatus !== 'PENDENTE'),
      })
  
      setTotalItems(filteredSolicitacoes.length)
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

  const handleClick = (status: 'pendentes' | 'historico') => {
    setCurrentPage(1)

    setSolicitacoesData((prevState) => ({
      ...prevState,
      all: prevState[status],
    }))
    setToogle(status === 'pendentes')
  }

  const handleSolicitacaoUpdate = async (updatedSolicitacao: Solicitacao) => {
    setSolicitacoesData((prevData) => {
      // Refiltra as solicitações após a atualização.
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
  
        const { usuario_cod, usuario_cargo } = response.data
        setUsuarioCod(usuario_cod)
        setUsuarioCargo(usuario_cargo)
        
        // Chama fetchSolicitacoes sempre que o cargo ou código do usuário for alterado
        await fetchSolicitacoes(usuario_cargo, usuario_cod)
      } catch (error) {
        console.error('Erro ao obter usuário:', error)
      }
    }
  
    initialize()
    }, [usuarioCod, usuarioCargo])  // Reexecutar quando o cargo ou código do usuário mudar
    
    useEffect(() => {
      paginateData()  // Reaplica a paginação após a mudança de solicitações
    }, [currentPage, solicitacoesData, toogle])
  

  const totalPages = Math.ceil(
    (toogle ? solicitacoesData.pendentes.length : solicitacoesData.historico.length) / itemsPerPage
  )

  return (
    <div className={styles.solicitacao_container}>
      <div className={styles.card_container}>
        <h1 className='font-bold text-4xl'>Solicitações</h1>

        <Tab
          toogle={toogle}
          onClick={handleClick}
          pendentes_length={solicitacoesData.pendentes.length}
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
                  solicitacao={solicitacao}
                  onSolicitacaoUpdate={handleSolicitacaoUpdate}
                  usuarioLogadoCod={usuarioCod}
                  usuarioCargo={usuarioCargo}
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
    </div>
  )
}

export default SolicitacaoPage
