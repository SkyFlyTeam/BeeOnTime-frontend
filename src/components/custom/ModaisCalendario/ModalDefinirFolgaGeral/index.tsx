interface DefinirFolgaGeral {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
    empCod: number;
    usuarioCod: number;
}

import { useEffect, useState } from "react";
import { isWeekend } from 'date-fns';

// Components
import { toast, ToastContainer } from "react-toastify";

// Styles
import styles from "../style.module.css";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Check, ChevronDown, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputBusca from "../../InputBusca/inputBusca";
import { Checkbox } from "@/components/ui/checkbox";
import { Usuario } from "@/interfaces/usuario";
import { usuarioServices } from "@/services/usuarioServices";
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectIcon, SelectItemIndicator, SelectTrigger } from "@radix-ui/react-select";
import { Setor } from "@/interfaces/setor";
import { setorServices } from "@/services/setorService";
import Folga from "@/interfaces/folga";
import { folgaService } from "@/services/folgaService";



const ModalDefinirFolgaGeral: React.FC<DefinirFolgaGeral> = ({
    onClose,
    onClick,
    empCod,
    diaSelecionado,
    usuarioCod
}) => {

    const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[] | null>(null);
    const [usuariosSelecionados, setUsuariosSelecionados] = useState<Usuario[] | null>(null);
    const [setores, setSetores] = useState<Setor[] | null>(null);

    const [filtro, setFiltro] = useState<'Todos' | 'Setor'>('Todos');
    const [selectedSetor, setSelectedSetor] = useState<Setor>();
    const [allSelected, setAllSelected] = useState(false);
    const [textoBusca, setTextoBusca] = useState("");
    const [usuarioQuantidade, setUsuarioQuantidade] = useState<number>();

    const [showSetorInput, setShowSetorInput] = useState(false);

    const fetchUsuarioEmpresa = async (empCod: number) => {
        try{
            const usuarios_response = await usuarioServices.getUsariosByEmpresa(empCod);
            const usuarios_sem_admin = (usuarios_response as Usuario[]).filter((usuario) => usuario.nivelAcesso.nivelAcesso_cod !== 0 && usuario.usuario_cod != usuarioCod);
            setUsuarios(usuarios_sem_admin);
            setUsuariosFiltrados(usuarios_sem_admin)
            setUsuarioQuantidade(usuarios_sem_admin.length);
        }catch(e){
            console.log("Erro ao buscar usuários")
        }
    }

    const fetchSetorEmpresa = async (empCod: number) => {
        try{
            const setores_response = await setorServices.verificarSetoresPorEmpresa(empCod);
            console.log("setores", setores_response)
            setSetores(setores_response);
        }catch(e){
            console.log("Erro ao buscar usuários")
        }
    }

    const handleSave =  async () => {
        try{
            if(!usuariosSelecionados || usuariosSelecionados.length < 1 ){ return }
            const dia_formatted = formatDateToYYYYMMDD(diaSelecionado);
            let mapped_folgas = usuariosSelecionados?.map((usuario) => {
                let mapped_folga = {
                    "folgaDataPeriodo": [
                       dia_formatted
                    ],
                    "folgaObservacao": "Folga Geral",
                    "folgaDiasUteis": isWeekend(diaSelecionado) ? 0 : 1, 
                    "usuarioCod": {
                         "usuario_cod": usuario.usuario_cod
                    },
                    "folgaTipo": {
                          "tipoFolgaCod": 1
                    }
                }
                return mapped_folga
            })

            for (const folga of mapped_folgas) {
                await folgaService.cadastrarFolga(folga);
            }
            onClose();
            showToast(true);
        }catch (err) {
            console.error("Erro ao salvar feriados.");
            showToast(false);
        }
    }
    
    useEffect(() => {
        fetchUsuarioEmpresa(empCod);
    }, [empCod])

    useEffect(() => {
        if(filtro == 'Setor'){
            setShowSetorInput(true);
            fetchSetorEmpresa(empCod);
        }else{
            setShowSetorInput(false);
            setSelectedSetor(undefined);
            setUsuariosFiltrados(usuarios);
            setUsuarioQuantidade(usuarios?.length);
        }
        setUsuariosSelecionados(null);
        if(allSelected == true){
            setAllSelected(false);
        }
    }, [filtro])

    useEffect(() => {
        const usuarios_by_setor = usuarios?.filter((usuario) => usuario.setor.setorCod == selectedSetor?.setorCod)
        if(usuarios_by_setor){
            setUsuariosFiltrados(usuarios_by_setor);
            setUsuarioQuantidade(usuarios_by_setor?.length);
        }
    }, [selectedSetor])

    const handleToggleFiltro = (status: 'Todos' | 'Setor') => {
        setFiltro(status)
    }

    const handleToggleUsuario = (usuario: Usuario) => {
        setUsuariosSelecionados((prevSelecionados) => {
            if(!prevSelecionados) { prevSelecionados = []}
            const jaSelecionado = prevSelecionados.some(
                (item) => item.usuario_cod === usuario.usuario_cod
            );

            if (jaSelecionado) {
                return prevSelecionados.filter(
                    (item) => !(item.usuario_cod === usuario.usuario_cod)
                );
            } else {
                return [...prevSelecionados, usuario];
            }
        });
    }

    useEffect(() => {
        if(allSelected == true){
            setUsuariosSelecionados(usuariosFiltrados);
        }else{
            setUsuariosSelecionados(null);
        }
    }, [allSelected])

    useEffect(() => {
        if (!usuarios) return;

        // Filtra por setor (se tiver setor selecionado)
        let filtrados = filtro === 'Setor' && selectedSetor
            ? usuarios.filter(u => u.setor.setorCod === selectedSetor.setorCod)
            : usuarios;

        // Filtra pela busca (no nome do usuário, por exemplo)
        if (textoBusca.trim() !== '') {
            const buscaLower = textoBusca.toLowerCase();
            filtrados = filtrados.filter(u => u.usuario_nome.toLowerCase().includes(buscaLower));
        }

        setUsuariosFiltrados(filtrados);

    }, [usuarios, filtro, selectedSetor, textoBusca]);

    const formatDateToYYYYMMDD = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

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
                <div className="flex w-full items-center">
                    <h4 className={styles.modalTitle}>Definir dia de folga</h4>
                </div>

                <div className="flex w-full items-center justify-between">
                    <span><b className="text-[#7C7A7B]">Dia selecionado:</b> {diaSelecionado.toLocaleDateString('pt-BR')}</span>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="bg-white text-base">
                                Filtros <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="z-[1000]">
                            <DropdownMenuCheckboxItem
                                checked={filtro == 'Todos'}
                                onCheckedChange={() => handleToggleFiltro('Todos')}
                                className={filtro === 'Todos' ? 'bg-[#FFF4D9]' : ''}
                            >
                                Todos
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filtro == 'Setor'}
                                onCheckedChange={() => handleToggleFiltro('Setor')}
                                className={filtro === 'Setor' ? 'bg-[#FFF4D9]' : ''}
                            >
                                Setor
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                {showSetorInput && 
                    <Select onValueChange={(val) => setSelectedSetor(setores?.find((setor) => Number(val) == setor.setorCod))}>
                        <SelectTrigger className="border p-2 rounded-md bg-white flex justify-between items-center w-[10rem] h-[2.3rem]">
                            <SelectValue placeholder="Setor" />
                            <ChevronDown size={16} />
                        </SelectTrigger>
                        <SelectContent className="z-[1000]">
                            <SelectGroup>
                            {setores?.map((setor) => (
                                <SelectItem key={setor.setorCod} value={String(setor.setorCod)}>
                                    {setor.setorNome}
                                </SelectItem>
                            ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                }

                <InputBusca value={textoBusca} onChange={(e) => setTextoBusca(e.target.value)} />

                <div className="w-full flex justify-between items-center">
                    <div className="flex gap-3">
                        <Checkbox 
                            className="mt-[0.25rem] w-[1.2rem] h-[1.2rem]" 
                            checked={allSelected == true}
                            onCheckedChange={() => setAllSelected(!allSelected)}
                        />
                        <span className="font-bold text-[1.1rem]">{selectedSetor ? selectedSetor.setorNome : 'Todos'}</span>
                    </div>
                    <span className="font-bold">{usuariosSelecionados ? usuariosSelecionados?.length : '0'} de {usuarioQuantidade} selecionado</span>
                </div>
                

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    {usuariosFiltrados ?  (usuariosFiltrados?.map((usuario) => (
                        <div className="flex gap-3" key={usuario.usuario_cod}>
                        <Checkbox 
                            className="mt-[0.1rem] w-[1.2rem] h-[1.2rem]" 
                            checked={usuariosSelecionados?.some(
                                (item) => item.usuario_cod === usuario.usuario_cod
                            )}
                            onCheckedChange={() => handleToggleUsuario(usuario)}
                        />
                        <span>{usuario.usuario_nome}</span>
                    </div>
                    ))) : (
                        <span className="self-center mt-auto">Usuários não encontrados.</span>
                    )}
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

export default ModalDefinirFolgaGeral;
