interface ResumoDiaProps {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
    empCod: number;
    dadosMes: {
        ferias?: any[];
        faltas?: Faltas[];
        folgas?: Folga[];
    } | null | undefined;
}

import { useEffect, useMemo, useState } from "react";

// Components


// Styles
import styles from "../style.module.css";
import Faltas from "@/interfaces/faltas";
import Folga from "@/interfaces/folga";
import { Usuario } from "@/interfaces/usuario";
import { usuarioServices } from "@/services/usuarioServices";
import { isSameDay } from "date-fns";
import { createDateFromString } from "@/utils/functions/createDateFromString";

type Dados = {
    faltas: Usuario[],
    folgas: Usuario[],
    ferias: Usuario[]
}

const ModalResumoDia: React.FC<ResumoDiaProps> = ({
    onClose,
    onClick,
    diaSelecionado,
    empCod,
    dadosMes
}) => {

    const [dados, setDados] = useState<Dados>();
    const [usuarios, setUsuarios] = useState<Usuario[] | null>(); 

    useMemo(() => {
        let colaboradores_faltas: any[] = [];
        let colaboradores_ferias: any[] = [];
        let colaboradores_folgas: any[] = [];

        if(dadosMes){
            if (Array.isArray(dadosMes.faltas)) {
                colaboradores_faltas = dadosMes.faltas.filter((falta) => {
                const faltaDate = createDateFromString(falta.faltaDia as string); 
                return isSameDay(faltaDate, diaSelecionado);
                }).map((falta) => {
                    return usuarios?.find((usuario) => usuario.usuario_cod == falta.usuarioCod);
                });
            }

            if (Array.isArray(dadosMes.ferias)) {
                colaboradores_ferias = dadosMes.ferias.filter((ferias) => {
                const feriasDate = createDateFromString(ferias.dia as string); 
                return isSameDay(feriasDate, diaSelecionado);
                }).map((ferias) => {
                    return usuarios?.find((usuario) => usuario.usuario_cod == ferias.usuarioCod);
                });
            }

            if (Array.isArray(dadosMes.folgas)) {
                colaboradores_folgas = dadosMes.folgas.filter((folga) => {
                    return folga.folgaDataPeriodo.some((dataStr) => {
                        const data = createDateFromString(dataStr); 
                        return isSameDay(data, diaSelecionado); 
                    });
                }).map((folga) => {
                    return usuarios?.find((usuario) => usuario.usuario_cod == folga.usuarioCod);
                });
            }
        }
        
        const dados_formatados: Dados = {
            faltas: colaboradores_faltas,
            ferias: colaboradores_ferias,
            folgas: colaboradores_folgas
        };

        setDados(dados_formatados);

    }, [dadosMes, usuarios])

    const fetchUsuarioEmpresa = async (empCod: number) => {
        try{
            const usuarios_response = await usuarioServices.getUsariosByEmpresa(empCod);
            setUsuarios(usuarios_response as Usuario[]);
        }catch(e){
            console.error("Erro ao buscar usuários")
        }
    }

    useEffect(() => {
        fetchUsuarioEmpresa(empCod);
    }, [empCod])
    
    return (
        <>
        <div className={styles.modal_container} onClick={onClick}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className="flex w-full items-center">
                    <h4 className={styles.modalTitle}>Resumo do dia</h4>
                </div>

                <span><b className="text-[#7C7A7B]">Dia selecionado:</b> {diaSelecionado.toLocaleDateString('pt-BR')}</span>

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores ausentes</span>
                        <ul>
                            {Array.isArray(dados?.faltas) ? (
                                dados.faltas.map((colaborador, idx) => {
                                if (!colaborador) return null;
                                return <li key={colaborador.usuario_cod ?? idx}>{colaborador.usuario_nome ?? "Sem nome"}</li>;
                                })
                            ) : null}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores de folga</span>
                        <ul>
                            {Array.isArray(dados?.folgas) ? (
                                dados.folgas.map((colaborador, idx) => {
                                if (!colaborador) return null; 
                                return <li key={colaborador.usuario_cod ?? idx}>{colaborador.usuario_nome ?? "Sem nome"}</li>;
                                })
                            ) : null}
                        </ul>
                    </div>
                    <div className="flex flex-col gap-2">
                        <span className="font-bold">Colaboradores de férias</span>
                        <ul>
                            {Array.isArray(dados?.ferias) ? (
                                dados.ferias.map((colaborador, idx) => {
                                if (!colaborador) return null;
                                return <li key={colaborador.usuario_cod ?? idx}>{colaborador.usuario_nome ?? "Sem nome"}</li>;
                                })
                            ) : null}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ModalResumoDia;
