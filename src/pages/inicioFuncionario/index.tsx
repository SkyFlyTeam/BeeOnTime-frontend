// General
import { useEffect, useState } from 'react';

// Services
import { getUsuario } from '@/services/authService';
import { pontoServices } from '@/services/pontoServices';

// Components
import TimeClock from '@/pages/inicioFuncionario/_components/time-clock';
import CardCargaHoraria from '@/components/custom/cardCargaHoraria';

// Interfaces
import { Usuario } from '@/interfaces/usuario';
import HistPontos from '@/interfaces/marcacaoPonto';

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
        return <div>Carregando...</div>; // Renderiza uma mensagem ou spinner enquanto carrega
    }

    return (
        <div className='flex flex-wrap flex-row justify-between'>
            <TimeClock />
            <CardCargaHoraria usuarioInfo={usuarioInfo!} histPontos={histPontos!} />
        </div>
    );
}
