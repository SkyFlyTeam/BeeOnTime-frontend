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
import { Skeleton } from '@/components/ui/skeleton';
import CardHorasTrabalhadas from './_components/cardHorasTrabalhadas/cardHorasTrabalhadas';
import CardFeriado from './_components/cardFeriado/cardFeriado';

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
            <div className='flex flex-col justify-items-center 
                '>
                <div className="flex flex-row flex-wrap gap-8 justify-between">
                    {/* Skeleton "Bater Ponto" */}
                    <Skeleton className='h-52 w-[30rem] bg-gray-200' />


                    {/* Skeleton "Carga diária" */}

                    <Skeleton className='h-52 w-[40rem] bg-gray-200' />

                </div>
                <div className='flex mt-8'>
                    <Skeleton className='h-36 w-[45rem] bg-gray-200' />
                </div>
            </div>
        ); // Renderiza uma mensagem ou spinner enquanto carrega
    }

    return (
        <div>
            <div className='flex flex-wrap flex-row gap-8'>
                <TimeClock />
                <CardCargaHoraria usuarioInfo={usuarioInfo!} histPontos={histPontos!} />

            </div>
            <div className='flex mt-8 flex-wrap flex-row gap-8'>
                <CardHorasTrabalhadas usuarioInfo={usuarioInfo} histPontos={histPontos!} />
                {/* <TimeClock /> */}
            </div>
            <div className='flex mt-8 flex-wrap flex-row gap-8'>
                <CardFeriado />
            </div>
            
        </div>
    );
}
