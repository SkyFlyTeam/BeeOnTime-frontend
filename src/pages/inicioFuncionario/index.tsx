import TimeClock from '@/pages/inicioFuncionario/_components/timeClock/time-clock';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUsuario } from '@/services/authService';

import { pontoServices } from '@/services/pontoServices';
import UsuarioInfo from '@/interfaces/usuarioInfo';
import HistPontos from '@/interfaces/hisPonto';
import CardCargaHoraria from './_components/cardCargaHoraria';

export default function InicioFuncionario() {
    const [nome, setNome] = useState("José");
    const [usuarioInfo, setUsuarioInfo] = useState<UsuarioInfo | null>(null);
    const [histPontos, setHistPontos] = useState<HistPontos[] | null>(null);
    const [loading, setLoading] = useState(true); // Estado para controle de carregamento

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario: UsuarioInfo = user.data;
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
        <div className='flex flex-wrap flex-row gap-8'>
            <TimeClock />
            <CardCargaHoraria usuarioInfo={usuarioInfo!} histPontos={histPontos!} />
        </div>
    );
}
