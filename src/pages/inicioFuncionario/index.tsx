// General
import { useEffect, useState } from 'react';

// Services
import { getUsuario } from '@/services/authService';
import { pontoServices } from '@/services/pontoServices';

// Components
import TimeClock from './_components/timeClock/time-clock';
import CardCargaHoraria from './_components/cardCargaHoraria';

// Interfaces
import { Usuario } from '@/interfaces/usuario';
import HistPontos from '@/interfaces/histPonto';
import ModalFerias from '@/components/custom/modalSolicitacao/modalFerias';
import { Skeleton } from '@/components/ui/skeleton';

export default function InicioFuncionario() {
    const [nome, setNome] = useState("José");
    const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null);
    const [histPontos, setHistPontos] = useState<HistPontos[] | null>(null);
    const [loading, setLoading] = useState(true); // Estado para controle de carregamento

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario: Usuario = user.data;
            setNome(usuario.usuario_nome);
            setUsuarioInfo(usuario);

            const histPontosData = await pontoServices.getPontosByUsuario(usuario.usuario_cod) as HistPontos[];
            setHistPontos(histPontosData);
        } catch (error) {
            console.error("Erro ao carregar informações:", error);
        } finally {
            setLoading(false); // Finaliza o carregamento após obter os dados
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col md:flex-row  justify-between">
                {/* Skeleton "Bater Ponto" */}
                <div className="">
                    <Skeleton className='h-52 w-96 bg-gray-200' />
                </div>

                {/* Skeleton "Carga diária" */}
                <div className="">
                    <Skeleton className='h-52 w-[30rem] bg-gray-200' />
                </div>
            </div>
        ); // Renderiza uma mensagem ou spinner enquanto carrega
    }

    return (
        <div className='flex flex-wrap flex-row gap-8'>
            <TimeClock />
            <CardCargaHoraria usuarioInfo={usuarioInfo!} histPontos={histPontos!} />
        </div>
    );
}
