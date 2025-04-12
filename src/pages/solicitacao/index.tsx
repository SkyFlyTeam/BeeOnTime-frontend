import { useEffect, useState } from 'react'
import { ApiException } from '../../config/apiExceptions'
import { solicitacaoServices } from '../../services/solicitacaoServices'
import SolicitationCard from './SolicitacaoCard'
import styles from './Solicitacao.module.css'
import Tab from '../../components/custom/tab'
import Modal from '../../components/custom/modalSolicitacao/index'
import SolicitacaoInterface from '../../interfaces/Solicitacao'
import ModalDevolutiva from '../../components/custom/modalSolicitacao/modalDevolutiva'
import { getUsuario } from '../../services/authService'

interface SolicitacoesState {
  all: SolicitacaoInterface[]
  pendentes: SolicitacaoInterface[]
  historico: SolicitacaoInterface[]
}

const Solicitacao = () => {
  const [openDevolutivaModal, setOpenDevolutivaModal] = useState<boolean>(false)
  const [isModalHoraExtraOpen, setIsModalHoraExtraOpen] = useState(false);

  const [usuarioCod, setUsuarioCod] = useState<number>(0)
  const [usuarioCargo, setUsuarioCargo] = useState<string>('')
  const [nivelAcessoCod, setNivelAcessoCod] = useState<number>()
  const [setorCod, setSetorCod] = useState()

  const [toogle, setToogle] = useState(false)

  const [solicitacoesData, setSolicitacoesData] = useState<SolicitacoesState>({
    all: [],
    pendentes: [],
    historico: [],
  })

  const [displayedSolicitacoes, setDisplayedSolicitacoes] = useState<SolicitacaoInterface[]>([])

  const [openModal, setOpenModal] = useState<{
    [key: string]: boolean
  }>({})

  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [totalItems, setTotalItems] = useState(0)

  const fetchSolicitacoes = async (usuarioCargo: string, usuarioCod: number, nivelAcessoCod: number, setorCod: number) => {
    let result: SolicitacaoInterface[] | ApiException | null = null
    if (nivelAcessoCod === 2) {
      result = await solicitacaoServices.getAllSolicitacaoByUsuario(usuarioCod) as SolicitacaoInterface[] | ApiException
    } else if (nivelAcessoCod === 1) {
      result = await solicitacaoServices.getAllSolicitacaoBySetor(setorCod) as SolicitacaoInterface[] | ApiException
    } else {
      result = await solicitacaoServices.getAllSolicitacao()
    }

    if (result instanceof ApiException || result === null) {
      setSolicitacoesData({
        all: [],
        pendentes: [],
        historico: [],
      })
      setTotalItems(0)
    } else {
  
      setSolicitacoesData({
        all: result.filter((s: SolicitacaoInterface) => s.solicitacaoStatus !== 'PENDENTE'),
        pendentes: result.filter((s: SolicitacaoInterface) => s.solicitacaoStatus === 'PENDENTE'),
        historico: result.filter((s: SolicitacaoInterface) => s.solicitacaoStatus !== 'PENDENTE'),
      })
  
      setTotalItems(result.length)
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

  const handleSolicitacaoUpdate = async (updatedSolicitacao: SolicitacaoInterface) => {
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
  
        const { usuario_cod, usuario_cargo, nivelAcesso_cod, setorCod } = response.data
        setUsuarioCod(usuario_cod)
        setUsuarioCargo(usuario_cargo)
        setNivelAcessoCod(nivelAcesso_cod)
        setSetorCod(setorCod)

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

                {nivelAcessoCod == 0 || nivelAcessoCod == 1 && (
                  <Modal
                    isOpen={openModal[solicitacao.solicitacaoCod]}
                    onClick={() => handleModal(solicitacao.solicitacaoCod, false)}
                    solicitacao={solicitacao}
                    onSolicitacaoUpdate={handleSolicitacaoUpdate}
                    usuarioLogadoCod={usuarioCod}
                    usuarioCargo={usuarioCargo}
                  />
                )}
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

export default Solicitacao
