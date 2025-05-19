interface DefinirFolgaCalendario {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
    empCod: number;
}

import { useEffect, useState } from "react";

// Components


// Styles
import styles from "../style.module.css";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, ChevronDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputBusca from "../../InputBusca/inputBusca";
import { Checkbox } from "@/components/ui/checkbox";
import { Usuario } from "@/interfaces/usuario";
import { usuarioServices } from "@/services/usuarioServices";
import { Select, SelectContent, SelectGroup, SelectItem, SelectValue } from "@/components/ui/select";
import { SelectIcon, SelectTrigger } from "@radix-ui/react-select";
import { Setor } from "@/interfaces/setor";
import { setorServices } from "@/services/setorService";



const ModalDefinirFolgaCalendario: React.FC<DefinirFolgaCalendario> = ({
    onClose,
    onClick,
    empCod,
    diaSelecionado
}) => {

    const [usuarios, setUsuarios] = useState<Usuario[] | null>(null);
    const [usuariosFiltrados, setUsuariosFiltrados] = useState<Usuario[] | null>(null);
    const [setores, setSetores] = useState<Setor[] | null>(null);

    const [filtro, setFiltro] = useState<'Todos' | 'Setor'>('Todos');
    const [selectedSetor, setSelectedSetor] = useState<Setor>();
    const [allUser, setAllUser] = useState(false);

    const [showSetorInput, setShowSetorInput] = useState(false);

    const fetchUsuarioEmpresa = async (empCod: number) => {
        try{
            const usuarios_response = await usuarioServices.getUsariosByEmpresa(empCod);
            setUsuarios(usuarios_response as Usuario[]);
            setUsuariosFiltrados(usuarios_response as Usuario[])
        }catch(e){
            console.log("Erro ao buscar usuários")
        }
    }

    const fetchSetorEmpresa = async (empCod: number) => {
        try{
            const setores_response = await setorServices.verificarSetoresPorEmpresa(empCod);
            setSetores(setores_response);
        }catch(e){
            console.log("Erro ao buscar usuários")
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
        }
    }, [filtro])

    const handleToggleFiltro = (status: 'Todos' | 'Setor') => {
        setFiltro(status)
    }

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
                            >
                                Todos
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                checked={filtro == 'Setor'}
                                onCheckedChange={() => handleToggleFiltro('Setor')}
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

                <InputBusca value="a" onChange={() => {}} />

                <div className="flex gap-3">
                    <Checkbox 
                        className="mt-[0.25rem] w-[1.2rem] h-[1.2rem]" 
                        // checked={feriadosSelecionados?.some(
                        //     (item) => item.data === feriado.data && item.feriado === feriado.feriado
                        // )}
                        // onCheckedChange={() => handleToggleFeriado(feriado)}
                    />
                    <span className="font-bold text-[1.1rem]">{selectedSetor ? selectedSetor.setorNome : 'Todos'}</span>
                </div>

                <div className="flex flex-col gap-3 w-full max-h-96 overflow-y-auto">
                    <div className="flex gap-3">
                        <Checkbox 
                            className="mt-[0.1rem] w-[1.2rem] h-[1.2rem]" 
                            // checked={feriadosSelecionados?.some(
                            //     (item) => item.data === feriado.data && item.feriado === feriado.feriado
                            // )}
                            // onCheckedChange={() => handleToggleFeriado(feriado)}
                        />
                        <span>Alice Montuani</span>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default ModalDefinirFolgaCalendario;
