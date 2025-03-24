import { useEffect, useState } from "react";
import { ApiException } from "@/src/config/apiExceptions";
import { solicitacaoServices } from "@/src/services/solicitacaoServices";
import SolicitationCard from "@/src/pages/solicitacao/SolicitacaoCard";
import styles from './Solicitacao.module.css';
import Tab from "@/src/components/custom/tab";
import Modal from "@/src/components/custom/modal";
import SolicitacaoInterface from '../../interfaces/Solicitacao';
import { useAuth } from "@/src/context/AuthContext"; 

const Solicitacao = () => {
  const { usuarioCargo, usuarioCod } = useAuth(); 
  const [toogle, setToogle] = useState(false);
  const [solicitacoesData, setSolicitacoesData] = useState<{
    all: SolicitacaoInterface[] | ApiException;
    pendentes: SolicitacaoInterface[] | ApiException;
    historico: SolicitacaoInterface[] | ApiException;
  }>({
    all: [],
    pendentes: [],
    historico: [],
  });

  const [openModal, setOpenModal] = useState<{
    [key: string]: boolean;
  }>({});

  const fetchSolicitacoes = async () => {
    const result = await solicitacaoServices.getAllSolicitacao();
  
    if (result instanceof ApiException) {
      setSolicitacoesData({
        all: result,
        pendentes: result,
        historico: result,
      });
    } else {
      let filteredSolicitacoes = result
      if (usuarioCargo === "Funcionário") {
        filteredSolicitacoes = result.filter(solicitacao => solicitacao.usuarioCod === usuarioCod);
      } else if (usuarioCargo === "Gestor") {
        filteredSolicitacoes = result.filter(
          solicitacao => solicitacao.usuarioCod === usuarioCod || solicitacao.usuarioCargo === "Funcionário"
        );
      } else if (usuarioCargo === "Administrador") {
        filteredSolicitacoes = result;
      }
  
      setSolicitacoesData({
        all: filteredSolicitacoes.filter(solicitacao => solicitacao.solicitacaoStatus !== "PENDENTE"),
        pendentes: filteredSolicitacoes.filter(solicitacao => solicitacao.solicitacaoStatus === "PENDENTE"),
        historico: filteredSolicitacoes.filter(solicitacao => solicitacao.solicitacaoStatus !== "PENDENTE"),
      });
    }
  };
  
  

  const handleModal = (solicitacaoCod: number, status: boolean) => {
    setOpenModal(prevState => ({
      ...prevState,
      [solicitacaoCod]: status,
    }));
  };

  const handleClick = (status: 'pendentes' | 'historico') => {
    setSolicitacoesData(prevState => ({
      ...prevState,
      all: prevState[status],
    }));

    setToogle(status === 'pendentes');
  };

  const handleSolicitacaoUpdate = async () => {
    await fetchSolicitacoes();

    if (toogle) {
      setSolicitacoesData(prevState => ({
        ...prevState,
        all: prevState.pendentes,
      }));
    } else {
      setSolicitacoesData(prevState => ({
        ...prevState,
        all: prevState.historico,
      }));
    }
  };

  useEffect(() => {
    fetchSolicitacoes();
  }, []);

  return (
    <div className={styles.solicitacao_container}>
      <div className={styles.card_container}>
        <h1>Solicitações</h1>

        <Tab
          toogle={toogle}
          onClick={handleClick}
          pendentes_length={Array.isArray(solicitacoesData.pendentes) ? solicitacoesData.pendentes.length : 0}
        />

        <div className={styles.container}>
          {Array.isArray(solicitacoesData.all) && solicitacoesData.all.length > 0 ? (
            solicitacoesData.all.map((solicitacao: SolicitacaoInterface) => (
              <>
                <SolicitationCard
                  key={solicitacao.solicitacaoCod}
                  solicitacao={solicitacao}
                  onClick={() => handleModal(solicitacao.solicitacaoCod, true)}
                  onSolicitacaoUpdate={handleSolicitacaoUpdate} 
                  usuarioCargo={solicitacao.usuarioCargo} 
                  usuarioCod={solicitacao.usuarioCod}               
                />

                <Modal
                  key={`${solicitacao.solicitacaoCod}-modal`}
                  isOpen={openModal[solicitacao.solicitacaoCod]}
                  onClick={() => handleModal(solicitacao.solicitacaoCod, false)}
                  solicitacao={solicitacao}
                  onSolicitacaoUpdate={handleSolicitacaoUpdate} 
                  usuarioLogadoCod={usuarioCod}                
                />
              </>
            ))
          ) : (
            <p>Não há solicitações {toogle ? <span>pendentes</span> : <span>a serem exibidas</span>}.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Solicitacao;
