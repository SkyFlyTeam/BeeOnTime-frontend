import { Calendar } from "@/components/ui/calendar";
import { pt } from 'date-fns/locale';
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import styles from './style.module.css';
import { toast } from "react-toastify";
import SolicitacaoInterface from "@/interfaces/Solicitacao";
import { solicitacaoServices } from "@/services/solicitacaoServices";
import { FileText } from "lucide-react";
// utils
import handleDownload from '@/utils/handleDownload'
import { folgaService } from "@/services/folgaService";
import { ApiException } from "@/config/apiExceptions";

// simulação de contagem de folgas por data
// const mockContagemFolgas = async (datas: Date[]): Promise<Record<string, number>> => {
//   const resultado: Record<string, number> = {};
//   for (const data of datas) {
//     const iso = data.toISOString().slice(0, 10);
//     resultado[iso] = Math.floor(Math.random() * 6); // aleatório para simulação
//   }
//   return resultado;
// };

interface ModalDecidirFolgaProps {
  solicitacaoSelected: SolicitacaoInterface
  onSolicitacaoUpdate: (updatedSolicitacao: SolicitacaoInterface) => void
  usuarioLogadoCod: number
  onClose: () => void
}

const ModalDecidirFolga = ({ solicitacaoSelected, onSolicitacaoUpdate, onClose, usuarioLogadoCod }: ModalDecidirFolgaProps) => {
  const [solicitacao, setSolicitacao] = useState<SolicitacaoInterface>();
//   const [contagemFolgas, setContagemFolgas] = useState<Record<string, number>>({});

  useEffect(() => {
    if (solicitacaoSelected) {
      const datas = (solicitacaoSelected.solicitacaoDataPeriodo as unknown as string[]).map(d => new Date(d));
      setSolicitacao({ ...solicitacaoSelected, solicitacaoDataPeriodo: datas });
    //   mockContagemFolgas(datas).then(setContagemFolgas);
    }
  }, [solicitacaoSelected]);

    const handleAprovarFolga = async () => {
        if (!solicitacao?.solicitacaoDataPeriodo || !solicitacao.usuarioCod) {
            toast.error("Solicitação inválida");
            return;
        }

        const folga = {
            folgaDataPeriodo: solicitacao.solicitacaoDataPeriodo.map(data =>
                new Date(data).toISOString().slice(0, 10)
            ),
            folgaObservacao: solicitacao.solicitacaoMensagem ?? "",
            folgaDiasUteis: solicitacao.solicitacaoDataPeriodo.length,
            usuarioCod: { usuario_cod: solicitacao.usuarioCod },
            folgaTipo: { tipoFolgaCod: 1 }
        };
        console.log(folga)
        const created = await folgaService.cadastrarFolga(folga);

        if (!(created instanceof ApiException)) {
            toast.success("Folga registrada com sucesso!");
        } else {
            toast.error("Erro ao registrar folga.");
            return
        }

        const updated = { ...solicitacao, solicitacaoStatus: 'APROVADA' };
        await solicitacaoServices.updateSolicitacao(updated);
        toast.success("Solicitação aprovada!");
        onSolicitacaoUpdate(updated);
        onClose();
    };


  const handleAprovar = async () => {
    if (!solicitacao) return;
    handleAprovarFolga()
  };

  const handleRecusar = async () => {
    if (!solicitacao) return;
    const updated = { ...solicitacao, solicitacaoStatus: 'REPROVADA' };
    await solicitacaoServices.updateSolicitacao(updated);
    toast.success("Solicitação recusada!");
    onSolicitacaoUpdate(updated);
    onClose();
  };

  return (
    <>
        <p className={styles.colaborador_label}>
            <span>Colaborador: </span>{solicitacao?.usuarioNome}
        </p>

        <div className={styles.calendar_container}>
            <Calendar
                locale={pt}
                mode="multiple"
                selected={solicitacao?.solicitacaoDataPeriodo as Date[]}
                className="rounded-md border"
                disabled 
            />
        </div>

        {/* <div className="mt-4">
            {Array.isArray(solicitacao?.solicitacaoDataPeriodo) &&
                (solicitacao.solicitacaoDataPeriodo as Date[]).map((data, idx) => {
                const iso = data.toISOString().slice(0, 10);
                return (
                    <div key={idx}>
                        Quantos estão de folga no dia {format(data, "dd/MM/yyyy")}: <strong>{contagemFolgas[iso] ?? '-'}</strong>
                    </div>
                );
            })}
        </div> */}


        <div className={styles.justificativa_content}>
            <label>Justificativa</label>
            <div className="w-full flex">
                <input type="text" value={solicitacao?.solicitacaoMensagem} readOnly className="w-[90%]" />
                {solicitacao?.solicitacaoAnexo && (
                    <button
                        type="button"
                        onClick={() => handleDownload(solicitacao.solicitacaoAnexo, solicitacao.solicitacaoAnexoNome || '')}
                        title="Baixar anexo"
                        style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        }}
                        className="w-[10%]"
                    >
                        <FileText strokeWidth={1} />
                    </button>
                )}
            </div>
        </div>
        
        {solicitacao && usuarioLogadoCod !== solicitacao.usuarioCod && solicitacao.solicitacaoStatus === "PENDENTE" && (
            <div className={styles.button_container}>
                <Button variant="outline-danger" size="sm" onClick={handleRecusar}>
                Recusar
                </Button>
                <Button variant="outline-success" size="sm" onClick={handleAprovar}>
                Aprovar
                </Button>
            </div>
        )}

    </>
  );
};

export default ModalDecidirFolga;
