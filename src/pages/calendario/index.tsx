import { useEffect, useState } from "react";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Services
import { getUsuario } from "@/services/authService";

// Components
import { Button } from "@/components/ui/button";
import ModalDefinirFeriado from "@/components/custom/ModaisCalendario/ModalDefinirFeriado";
import { EmpresaAPI } from "@/interfaces/empresa";
import { empresaServices } from "@/services/empresaService";

export default function Calendario() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [empresa, setEmpresa] = useState<EmpresaAPI | null>(null);
    const [acessoCod, setAcessoCod] = useState<number | null>(null);

    const [showModalDefinirFeriado, setShowModalDefinirFeriado] = useState(false);

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

    const fetchEmpresa = async (empCod: number) => {
        try {
            const empresa_data = await empresaServices.verificarEmpresaById(empCod);
            setEmpresa(empresa_data);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    useEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        if(usuario?.empCod){
            fetchEmpresa(usuario!.empCod);
        }
    }, [usuario])

    return(
        <>
            <div className="flex w-full justify-start items-center mb-4">
                <h1 className="text-xl md:text-3xl font-semibold">
                    {acessoCod === 0 ? 'Calendário da Empresa' : 'Meu Calendário'}
                </h1>
            </div>

            <div className="flex w-full flex-col justify-center gap-3">
                <div className="flex w-full justify-between items-center">
                    {acessoCod === 0 &&
                        <Button
                            variant='warning'
                            onClick={() => setShowModalDefinirFeriado(true)}
                            size='sm'
                        >
                            Definir Feriados
                        </Button>
                    }
                </div>
            </div>

            {showModalDefinirFeriado &&
                <ModalDefinirFeriado 
                    empresa={empresa!}
                    onClose={() => setShowModalDefinirFeriado(false)}
                    onClick={() => setShowModalDefinirFeriado(false)}
                />
            }

        </>
    )
}
