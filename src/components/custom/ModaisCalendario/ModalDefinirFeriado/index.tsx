interface DefinirFeriadoProps {
    empresa: EmpresaAPI;
    onClose: () => void;
    onClick: () => void;
}

import { useEffect, useState } from "react";

// Components
import { Checkbox } from "@/components/ui/checkbox";
import { toast, ToastContainer } from "react-toastify";

// Styles
import styles from "../style.module.css";

import { Feriado, FeriadoAPIResponse } from "@/interfaces/feriado";
import { feriadoServices } from "@/services/feriadoService";
import { Empresa, EmpresaAPI } from "@/interfaces/empresa";
import { slugify } from "@/utils/functions/slungify";
import { Button } from "@/components/ui/button";

const ModalDefinirFeriado: React.FC<DefinirFeriadoProps> = ({
    empresa,
    onClose,
    onClick,
}) => {
    const [feriados, setFeriados] = useState<null | FeriadoAPIResponse[]>(null);
    const [feriadosSelecionados, setFeriadosSelecionados] = useState<null | FeriadoAPIResponse[]>(null);

    const currentData = new Date();

    const fetchFeriados =  async (ano: string, empEstado: string, empMunicipio: string) => {
        try{
            const feriados_response = await feriadoServices.getAllFeriadoFromAPI(empEstado, empMunicipio, ano);
            return feriados_response as FeriadoAPIResponse[];
        }catch (err) {
           console.error("Erro ao pegar dados dos feriados pela API.");
        }
    }

    useEffect(() => {

        const loadFeriados = async () => {
            let feriados_set: FeriadoAPIResponse[];

            const feriados_storage = localStorage.getItem("feriados");
            if (feriados_storage) {
                feriados_set = JSON.parse(feriados_storage);
            } else {

                const anoStr = currentData.getFullYear().toString();
                let feriados_response = await fetchFeriados(
                    anoStr,
                    empresa.empEstado,
                    slugify(empresa.empCidade)
                );
                feriados_set = feriados_response as FeriadoAPIResponse[];
                localStorage.setItem("feriados", JSON.stringify(feriados_set));
            }


            const feriadosUnicos = feriados_set?.filter((feriado, index, self) => 
                index === self.findIndex((t) => (
                    t.data === feriado.data 
                ))
            );

            const feriadosOrdenadosBR = feriadosUnicos?.sort((a, b) => {
                return parseBRDate(a.data as string).getTime() 
                    - parseBRDate(b.data as string).getTime();
            });

            if(feriadosOrdenadosBR){
                setFeriados(feriadosOrdenadosBR);
            }
            
        };

        if (empresa) {
            loadFeriados();
        }
    }, [empresa]);

    useEffect(() => {
        feriados?.map((feriado) => {
            if(feriado.tipo == "feriado"){
                setFeriadosSelecionados((prevSelecionados) => {
                    if(!prevSelecionados) { prevSelecionados = []}
                    const jaSelecionado = prevSelecionados.some(
                        (item) => item.data === feriado.data && item.feriado === feriado.feriado
                    );

                    if (jaSelecionado) {
                        return prevSelecionados.filter(
                            (item) => !(item.data === feriado.data && item.feriado === feriado.feriado)
                        );
                    } else {
                        return [...prevSelecionados, feriado];
                    }
                });
            }
        })
    }, [feriados])

    const handleToggleFeriado = (feriado: FeriadoAPIResponse) => {
        setFeriadosSelecionados((prevSelecionados) => {
            if(!prevSelecionados) { prevSelecionados = []}
            const jaSelecionado = prevSelecionados.some(
                (item) => item.data === feriado.data && item.feriado === feriado.feriado
            );

            if (jaSelecionado) {
                return prevSelecionados.filter(
                    (item) => !(item.data === feriado.data && item.feriado === feriado.feriado)
                );
            } else {
                return [...prevSelecionados, feriado];
            }
        });
    };

    const handleSave =  async () => {
        try{
            if(!feriados || feriados.length < 1 ){ return }
            let mapped_feriados: Feriado[] = feriados?.map((feriado) => {
                let mapped_feriado: Feriado = {
                    feriadoNome: feriado.feriado,
                    feriadoData: parseBRDateToString(feriado.data as string),
                    empCod: empresa.empCod
                }
                return mapped_feriado
            })
            const feriados_response = await feriadoServices.cadastrarFeriados(mapped_feriados);
            showToast(true);
        }catch (err) {
           console.error("Erro ao salvar feriados.");
            showToast(false);
        }
    }

    function formatarData(data: string) {
        const [diaString, mesString, anoString] = data.split('/');

        // Crie a data no formato "YYYY-MM-DD"
        const novaData = new Date(Number(anoString), Number(mesString) - 1, Number(diaString));

        const formato = new Intl.DateTimeFormat('pt-BR', {
            weekday: 'long',
            month: 'long',
            day: '2-digit',
        }).format(novaData);

        // Quebra a string formatada para separar o dia da semana, mês e dia
        const [semana, dataFormatada] = formato.split(',');

        // Retorna a data formatada de acordo com o padrão desejado
        return `${dataFormatada} - ${semana}`;
    }

    function parseBRDate(brDate: string) {
        const [day, month, year] = brDate.split('/');
        return new Date(`${year}-${parseInt(month) - 1}-${day}`);
    }

    function parseBRDateToString(brDate: string) {
        const [day, month, year] = brDate.split('/');
        return `${year}-${month}-${day}`;
    }

    const showToast = (success: boolean) => {
        success ? showSucessToast() : showErrorToast();
    }

    const showSucessToast = () => {
        toast.success("Feriados salvos com sucesso!", {
            position: "top-center",
        });
    };

    const showErrorToast = () => {
        toast.error("Erro salvar feriados.", {
            position: "top-center",
        });
    };

    return (
        <>
        <div className={styles.modal_container} onClick={onClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full justify-between items-center">
                    <h4 className={styles.modalTitle}>Definir Feriado</h4>
                    <span className={styles.flagFacultativo}>Facultativo</span>
                </div>

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    {feriados ? feriados?.map((feriado, index) => (
                        <div className="flex gap-3" key={index}>
                            <Checkbox 
                                className="mt-[0.2rem] w-[1.2rem] h-[1.2rem]" 
                                checked={feriadosSelecionados?.some(
                                    (item) => item.data === feriado.data && item.feriado === feriado.feriado
                                )}
                                onCheckedChange={() => handleToggleFeriado(feriado)}
                            />
                            <div className="flex flex-col">
                                <span>{formatarData(feriado.data as string)}</span>
                                {feriado.tipo == 'feriado' 
                                    ? <span className="text-gray-500">{feriado.feriado}</span>
                                    : <span className={styles.flagFacultativo}>{feriado.feriado}</span>
                                }
                                
                            </div>
                        </div>
                    )): null}
                </div>

                <Button
                    variant='warning'
                    onClick={handleSave}
                    size='sm'
                >
                Salvar
                </Button>
            </div>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
        </>
    );
};

export default ModalDefinirFeriado;
