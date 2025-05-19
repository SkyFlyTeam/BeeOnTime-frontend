interface DefinirFolgaCalendario {
    onClose: () => void;
    onClick: () => void;
    diaSelecionado: Date;
}

import { useEffect, useState } from "react";

// Components


// Styles
import styles from "../style.module.css";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import InputBusca from "../../InputBusca/inputBusca";
import { Checkbox } from "@/components/ui/checkbox";



const ModalDefinirFolgaCalendario: React.FC<DefinirFolgaCalendario> = ({
    onClose,
    onClick,
    diaSelecionado
}) => {
    
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
                                // checked={column.getIsVisible()}
                                // onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                Todos
                            </DropdownMenuCheckboxItem>
                            <DropdownMenuCheckboxItem
                                // checked={column.getIsVisible()}
                                // onCheckedChange={(value) => column.toggleVisibility(!!value)}
                            >
                                Setor
                            </DropdownMenuCheckboxItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <InputBusca value="a" onChange={() => {}} />

                <div className="flex gap-3">
                    <Checkbox 
                        className="mt-[0.25rem] w-[1.2rem] h-[1.2rem]" 
                        // checked={feriadosSelecionados?.some(
                        //     (item) => item.data === feriado.data && item.feriado === feriado.feriado
                        // )}
                        // onCheckedChange={() => handleToggleFeriado(feriado)}
                    />
                    <span className="font-bold text-[1.1rem]">Todos</span>
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
