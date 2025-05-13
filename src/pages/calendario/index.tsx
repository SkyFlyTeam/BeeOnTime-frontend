import { useEffect, useState } from "react";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Services
import { getUsuario } from "@/services/authService";

// Components
import { Button } from "@/components/ui/button";
import ModalDefinirFeriado from "@/components/custom/ModaisCalendario/ModalDefinirFeriado";

export default function Calendario() {
    const [usuario, setUsuario] = useState<Usuario | null>(null);
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

    useEffect(() => {
        getUser();
    }, [])

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
                            Definir Feriado
                        </Button>
                    }
                </div>
            </div>

            {showModalDefinirFeriado &&
                <ModalDefinirFeriado 
                    empCod={usuario?.empCod}
                    onClose={() => setShowModalDefinirFeriado(false)}
                    onClick={() => setShowModalDefinirFeriado(false)}
                />
            }

        </>
    )
}
