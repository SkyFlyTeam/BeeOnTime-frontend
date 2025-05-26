import { Button } from "@/components/ui/button";
import { SliderCustom } from "@/components/ui/custom/sliderCustom";
import { HistoricoCompensacao, BancoHoras } from "@/interfaces/bancoHoras";
import ExtrasPagas from "@/interfaces/extraPaga";
import { Usuario } from "@/interfaces/usuario";
import { getUsuario } from "@/services/authService";
import { bancoHorasServices } from "@/services/bancoHorasService";
import { extrasPagasServices } from "@/services/extraPagaService";
import { HistoricoCompensacaoServices } from "@/services/historicoCompensacaoService";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

interface CardBancoHorasProps {
    usuarioCod: number;
}

export const CardBancoHoras = ({ usuarioCod }: CardBancoHorasProps) => {

    const [bancoHoras, setBancoHoras] = useState<BancoHoras | null>(null);
    const [extrasPagas, seExtrasPagas] = useState<ExtrasPagas | null>(null);

    const [loading, setLoading] = useState(true);
    const currentData = new Date();

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [acessoCod, setAcessoCod] = useState<number | null>(null);

    const [extraSlider, setExtraSliderValue] = useState(0);
    const [bancoExtraSoma, setBancoExtraSoma] = useState(0);
    const [showChangeBanco, setShowChangeBanco] = useState(false);
    const [valorAdicional, setValorAdicional] = useState(0);
    const [sliderKey, setSliderKey] = useState(0);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;
            setUsuario(usuario);
            setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    const fetchBancoHoras = async (date: string, usuarioCod: number) => {
        try{
            const data = await bancoHorasServices.getBancoHorasSaldoAtual(usuarioCod, date);
            setBancoHoras(data as BancoHoras);
        }catch (err) {
           console.error("Erro ao carregar dados.");
        }
    }

    const fetchExtrasPaga = async (date: string, usuarioCod: number) => {
        try{
            const data = await extrasPagasServices.getExtrasPagasSaldoAtual(usuarioCod, date);
            seExtrasPagas(data as ExtrasPagas);
            setLoading(false);
        }catch (err) {
            setExtraSliderValue(0);
           console.error("Erro ao carregar dados.");
        }
    }

    useEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        const dataFormatada = currentData.toISOString().split('T')[0];

        fetchBancoHoras(dataFormatada, usuarioCod);
        fetchExtrasPaga(dataFormatada, usuarioCod);
    }, [usuarioCod])

    useEffect(() => {
        if(extrasPagas?.extrasPagasSaldoAtual){
            setExtraSliderValue(extrasPagas?.extrasPagasSaldoAtual)
        } 
    }, [extrasPagas])

    useEffect(() => {
        if(!bancoHoras?.bancoHorasSaldoAtual && !extrasPagas?.extrasPagasSaldoAtual) return

        let res_soma
        if(!extrasPagas?.extrasPagasSaldoAtual){ 
            res_soma = bancoHoras?.bancoHorasSaldoAtual!
        }else{
            res_soma = bancoHoras?.bancoHorasSaldoAtual! + extrasPagas?.extrasPagasSaldoAtual;
        }

        setBancoExtraSoma(res_soma)
    }, [bancoHoras])

    const onSliderValueChange = (value: number[]) => {
        setExtraSliderValue(value[0]);

        let valor_adicional

        if( extrasPagas?.extrasPagasSaldoAtual){
            valor_adicional  =  value[0] - extrasPagas?.extrasPagasSaldoAtual;
        }else{
            valor_adicional = value[0];
        }

        if(valor_adicional > 0){
            setShowChangeBanco(true);
        }else{
            setShowChangeBanco(false);
        }
        setValorAdicional(valor_adicional);
    }

    const handleEditBancoHoras = async () => {
        const dataAtual = new Date();
        const dataFormatada = dataAtual.toISOString().split('T')[0];

        let bancoCod;
        let updatedBancoHoras;

        // Atualizando/criando registro de banco de horas
        try {
            // Se já existir um registro de banco de horas na data atual, atualizo
            if(bancoHoras?.bancoHorasData == dataFormatada){
                updatedBancoHoras = {
                    ...bancoHoras!,
                    bancoHorasSaldoAtual: bancoHoras?.bancoHorasSaldoAtual! - valorAdicional,
                }

                await bancoHorasServices.updatedBancoHoras(updatedBancoHoras)
                bancoCod = bancoHoras.bancoHorasCod;
            }else{ // Caso não exista, crio um novo registro de banco de horas
                updatedBancoHoras = {
                    usuarioCod: usuarioCod,
                    bancoHorasSaldoAtual: bancoHoras?.bancoHorasSaldoAtual! - valorAdicional,
                    bancoHorasData: dataFormatada
                }

                const novoBanco = await bancoHorasServices.createBancoHoras(updatedBancoHoras);
                bancoCod = (novoBanco as BancoHoras).bancoHorasCod;
            }
        } catch(e){
            console.error("Erro ao atualizar/criar banco de horas");
            showToast(false);
            return;
        }

        if(!bancoCod){ console.error("faltando bancoCod"); showToast(false); return }

        let updatedExtraPaga

        // Atualizando/criando extra paga
        try {
            // Se já existir um registro de extra paga na data atual, atualizo
            if(extrasPagas?.extrasPagasData == dataFormatada){
                updatedExtraPaga = {
                    ...extrasPagas!,
                    extrasPagasSaldoAtual: extrasPagas?.extrasPagasSaldoAtual! + valorAdicional,
                }  
                await extrasPagasServices.updatedExtraPaga(updatedExtraPaga as ExtrasPagas)
            }else{ // Caso não exista, crio um novo registro de extra paga
                if(!extrasPagas?.extrasPagasSaldoAtual){
                    updatedExtraPaga = {
                        extrasPagasSaldoAtual: valorAdicional,
                        extrasPagasData: dataFormatada,
                        usuarioCod: usuarioCod
                    }
                }else{
                    updatedExtraPaga = {
                        extrasPagasSaldoAtual: extrasPagas?.extrasPagasSaldoAtual! + valorAdicional,
                        extrasPagasData: dataFormatada,
                        usuarioCod: usuarioCod
                    }
                }
                await extrasPagasServices.createExtraspagas(updatedExtraPaga);
            }
        } catch(e){
            console.error("Erro ao atualizar/criar extra paga");
            showToast(false);
            return;
        }

        const histCompesacao = {
            histCompensacaoTotal: valorAdicional,
            tipoCompensacaoCod: {
                tipoCompensacaoCod: 2
            },
            bancoHorasCod: {
                bancoHorasCod: bancoCod
            }
        }

        try{
            await HistoricoCompensacaoServices.createHistCompesacao(histCompesacao);
        }catch(e){
            console.error("Erro ao criar registro de histórico de compesação");
            showToast(false);
            return;
        }

        showToast(true);
        setShowChangeBanco(false);
        setValorAdicional(0);

        fetchBancoHoras(dataFormatada, usuarioCod);
        fetchExtrasPaga(dataFormatada, usuarioCod);
    }

      const showToast = (success: boolean) => {
          success ? showSucessToast() : showErrorToast();
      }

      const showSucessToast = () => {
        toast.success("Banco de horas convertido em extras pagas com sucesso!", {
          position: "top-center",
        });
      };

      const showErrorToast = () => {
        toast.error("Erro ao converter banco de horas em extra paga.", {
          position: "top-center",
        });
      };

    return(
        loading ? (
            <></>
        ) : (
            <>
                <div className="w-[40rem] flex flex-col items-center justify-center gap-6 bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] rounded-xl p-6">
                    <h1 className="text-xl font-semibold">Banco de Horas</h1>
                    <div className="flex flex-col gap-2 w-full">
                        <div className="flex justify-between w-full">
                            <span>Horas extras pagas</span>
                            <span>Banco de horas</span>
                        </div>
                        <SliderCustom 
                            key={sliderKey}
                            value={[extraSlider]}
                            min={extrasPagas?.extrasPagasSaldoAtual}
                            max={bancoExtraSoma} 
                            step={1} 
                            onValueChange={onSliderValueChange} 
                            legend={true} 
                            legendSuffix="h"
                        />
                    </div>
                    {showChangeBanco &&
                        <div className="w-fit flex gap-3 self-end items-center">
                            <span>{`Adicionar ${valorAdicional} ${valorAdicional <= 1 ? 'hora extra paga' : 'horas extras pagas'}?`}</span>
                            <Button variant={"outline"} onClick={handleEditBancoHoras} className="border-green-700 text-green-700 py-0 px-4 hover:bg-green-700 hover:text-white transition-all duration-200">Sim</Button>
                            <Button variant={"outline"} onClick={() => {setShowChangeBanco(false); setValorAdicional(0); setSliderKey(prev => prev + 1);}} className="border-red-700 text-red-700 py-0 px-4 hover:bg-red-700 hover:text-white transition-all duration-200">Não</Button>
                        </div>
                    }
                </div>
                <ToastContainer position="top-center" autoClose={3000} />
            </>
        )

    )
}

export default CardBancoHoras;