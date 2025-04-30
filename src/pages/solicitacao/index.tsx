import { JSX, useEffect, useState } from 'react'
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
import BotaoDropdownSolicitacao from '../../components/custom/BotaoSolicitacao/dropdownSolicitacao'; // Ajuste o caminho conforme necessário


import { Skeleton } from '@/components/ui/skeleton'
import SolicitacaoCardSkeleton from './SolicitacaoCard/cardSkeleton'
import ModalSolictarHoraExtra from '@/components/custom/modalSolicitacao/modalAusenciaMedica/modalSolicitarHoraExtra'
import ModalSolictarAusenciaMedica from '@/components/custom/modalSolicitacao/modalAusenciaMedica/modalSolicitarHoraExtra'

interface SolicitacoesState {
  all: SolicitacaoInterface[];
  pendentes: SolicitacaoInterface[];
  historico: SolicitacaoInterface[];
  analisesPendentes?: SolicitacaoInterface[]
  analisesHistorico?: SolicitacaoInterface[]
  meusPendentes?: SolicitacaoInterface[]
  meusHistorico?: SolicitacaoInterface[]
}

const Solicitacao = () => {
  // Modais
  const [openDevolutivaModal, setOpenDevolutivaModal] = useState<boolean>(false);
  const [openModal, setOpenModal] = useState<{ [key: string]: boolean }>({});
  const [modalAberto, setModalAberto] = useState<string | null>(null)
  const [isModalHoraExtraOpen, setIsModalHoraExtraOpen] = useState(false);

  // Informações do usuário
  const [usuarioCod, setUsuarioCod] = useState<number>(0)
  const [usuarioCargo, setUsuarioCargo] = useState<string>('')
  const [nivelAcessoCod, setNivelAcessoCod] = useState<number>()
  const [setorCod, setSetorCod] = useState()
  const [cargaHoraria, setCargaHoraria] = useState<number>()

  const [toogle, setToogle] = useState(false);

  const [solicitacoesData, setSolicitacoesData] = useState<SolicitacoesState>({
    all: [],
    pendentes: [],
    historico: [],
    analisesPendentes: [],
    analisesHistorico: [],
    meusPendentes: [],
    meusHistorico: [],
  });

  const handleOpenModal = (tipo: string) => {
    setModalAberto(tipo)
  }



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
        const solicitacoes = result as SolicitacaoInterface[]

        const minhas = solicitacoes.filter(s => s.usuarioCod === usuarioCod)
        const analises = solicitacoes.filter(s => s.usuarioCod !== usuarioCod)
        
        const ordenar = (arr: SolicitacaoInterface[]) =>
          [...arr].sort((a, b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime())

        setSolicitacoesData({
          all: ordenar([...minhas, ...analises]),
          pendentes: [],
          historico: [],
          analisesPendentes: ordenar(analises.filter(s => s.solicitacaoStatus === 'PENDENTE')),
          analisesHistorico: ordenar(analises.filter(s => s.solicitacaoStatus !== 'PENDENTE')),
          meusPendentes: ordenar(minhas.filter(s => s.solicitacaoStatus === 'PENDENTE')),
          meusHistorico: ordenar(minhas.filter(s => s.solicitacaoStatus !== 'PENDENTE')),
        })
      
        setDisplayedSolicitacoes(ordenar(analises.filter(s => s.solicitacaoStatus === 'PENDENTE')).slice(0, itemsPerPage))
        return
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
    let dataToDisplay: SolicitacaoInterface[] = [];
  
    if (nivelAcessoCod === 1) {
      dataToDisplay = toogle
        ? [
            ...(solicitacoesData.analisesPendentes || []),
            ...(solicitacoesData.analisesHistorico || [])
          ]
        : [
            ...(solicitacoesData.meusPendentes || []),
            ...(solicitacoesData.meusHistorico || [])
          ];
    } else {
      dataToDisplay = toogle
        ? solicitacoesData.pendentes
        : solicitacoesData.historico;
    }
  
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    setDisplayedSolicitacoes(dataToDisplay.slice(start, end));
  };
  

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleModal = (solicitacaoCod: number, status: boolean) => {
    if (solicitacaoCod === 0) {
      setIsModalHoraExtraOpen(false)
      return
    }
    setOpenModal((prevState) => ({
      ...prevState,
      [solicitacaoCod]: status,
    }));

    if (status === true) {
      handleDevolutivaModal(false);
    }
  };

  const handleDevolutivaModal = (status: boolean) => {
    setOpenDevolutivaModal(status);
  };

  const handleClick = (status: string) => {
    setCurrentPage(1)
    setToogle(status === 'PENDENTES' || status === 'ANÁLISES');

    if (status === 'PENDENTES') {
      fecharTodosModais();
    }
  }

  const fecharTodosModais = () => {
    setOpenDevolutivaModal(false);
    setOpenModal({}); // Fecha todos modais mapeados
    setModalAberto(null);
    setIsModalHoraExtraOpen(false);
  };

  // Atualizar lista
  const handleSolicitacaoUpdate = async (updatedSolicitacao: SolicitacaoInterface) => {
    setSolicitacoesData((prevData) => {
      const updatedPendentes = prevData.pendentes.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== updatedSolicitacao.solicitacaoCod
      );
      const updatedHistorico = prevData.historico.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== updatedSolicitacao.solicitacaoCod
      )

      if (updatedSolicitacao.solicitacaoStatus === 'PENDENTE') {
        updatedPendentes.push(updatedSolicitacao);
      } else {
        updatedHistorico.push(updatedSolicitacao);
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
      );
      const updatedHistorico = prevData.historico.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== idToDelete
      );
      const updatedAll = prevData.all.filter(
        (solicitacao) => solicitacao.solicitacaoCod !== idToDelete
      );
      return {
        ...prevData,
        pendentes: updatedPendentes,
        historico: updatedHistorico,
        all: updatedAll,
      };
    });

    setDisplayedSolicitacoes((prev) =>
      prev.filter((solicitacao) => solicitacao.solicitacaoCod !== idToDelete)
    );
  };

  // Novo mapeamento de Modal para renderização automática
  {/* ========= Modais de solicitações ========= */}
  const modaisMapeados: { [key: string]: JSX.Element } = {
    'Hora extra': (
      <ModalSolicitarHoraExtra
        usuarioCod={usuarioCod}
        cargaHoraria={cargaHoraria ? cargaHoraria : 0}
        onClose={() => setModalAberto(null)}
        onSolicitacaoUpdate={handleSolicitacaoUpdate}
      />
    ),
    'Ausência médica': (
      <ModalSolictarAusenciaMedica
        usuarioCod={usuarioCod}
        cargaHoraria={cargaHoraria ? cargaHoraria : 0}
        onClose={() => setModalAberto(null)}
        onSolicitacaoUpdate={handleSolicitacaoUpdate}
      />
    )
  };



  useEffect(() => {
    const initialize = async () => {
      try {
        const response = await getUsuario();
        if (!response || !response.data) {
          console.error('Usuário não encontrado.');
          return;
        }

        const { usuario_cod, usuario_cargo, nivelAcesso_cod, setorCod, usuario_cargaHoraria } = response.data
        setUsuarioCod(usuario_cod)
        setUsuarioCargo(usuario_cargo)
        setNivelAcessoCod(nivelAcesso_cod)
        setSetorCod(setorCod)
        setCargaHoraria(usuario_cargaHoraria)


        await fetchSolicitacoes(usuario_cargo, usuario_cod, nivelAcesso_cod, setorCod);
      } catch (error) {
        console.error('Erro ao obter usuário:', error);
      }
    }

    initialize()
  }, [usuarioCod, usuarioCargo, nivelAcessoCod, setorCod])

  useEffect(() => {
    paginateData()
  }, [currentPage, solicitacoesData, toogle])


  const totalPages = Math.ceil(
    (
      nivelAcessoCod === 1
        ? (toogle
          ? (solicitacoesData.analisesPendentes?.length || 0) + (solicitacoesData.analisesHistorico?.length || 0)
          : (solicitacoesData.meusPendentes?.length || 0) + (solicitacoesData.meusHistorico?.length || 0))
        : (toogle
          ? solicitacoesData.pendentes.length
          : solicitacoesData.historico.length)
    ) / itemsPerPage
  );

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

        <div className='flex flex-row' style={{ justifyContent: nivelAcessoCod !== 0 ? 'space-between' : 'center' }}>

        {nivelAcessoCod === 1 ?  
          <Tab
          activeTab={toogle ? 'ANÁLISES' : 'MEUS PEDIDOS'}
          onClick={handleClick}
          tabLabels={['ANÁLISES', 'MEUS PEDIDOS']}  
          pendentesLength={[
            solicitacoesData.analisesPendentes!.length, 
            solicitacoesData.meusPendentes!.length
          ]}
          showBadge={true}  
          />
          :
          <Tab
            activeTab={toogle ? 'PENDENTES' : 'HISTÓRICO'}
            onClick={handleClick}
            tabLabels={['PENDENTES', 'HISTÓRICO']}  
            pendentesLength={[solicitacoesData.pendentes.length]}
            showBadge={true}  
          />
        }
       

          {/* Componente do dropdown e modais */}
          {nivelAcessoCod != 0 && (
          <BotaoDropdownSolicitacao
              usuarioCod={usuarioCod}
              usuarioCargo={usuarioCargo}
              handleSolicitacaoUpdate={handleSolicitacaoUpdate}
              onOpenModal={handleOpenModal}
            />
          )}


        </div>

        {/* Renderizar Modal automaticamente */}
        {modalAberto && (
          <Modal
            isOpen={!!modalAberto}
            onClick={() => setModalAberto(null)}
            title={modalAberto}
          >
            {modaisMapeados[modalAberto]}
          </Modal>
        )}
        

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
                {'<'}
              </button>

              {Array.from({ length: totalPages }, (_, index) => {
                const page = index + 1;
                if (page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1) {
                  return (
                    <button
                      key={page}
                      className={`${styles.pageButton} ${currentPage === page ? styles.activePage : ''}`}
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  );
                } else if (Math.abs(page - currentPage) === 2 && page < currentPage) {
                  return <span key={`left-ellipsis`} className={styles.ellipsis}>...</span>;
                } else if (Math.abs(page - currentPage) === 2 && page > currentPage) {
                  return <span key={`right-ellipsis`} className={styles.ellipsis}>...</span>;
                }

                return null;
              })}

              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                {'>'}
              </button>
            </div>
          )}
        </div>
      </div>

      
    </div>
  );
};

export default Solicitacao;