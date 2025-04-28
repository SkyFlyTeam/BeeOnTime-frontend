// General
import { useEffect, useState } from 'react';

// Services
import { getUsuario } from '@/services/authService';

// Components
import InicioFuncionario from './inicioFuncionario';
import CalendarFeriasGestor from '@/components/custom/CalendarFerias/calendarFeriasGestor';
import ModalFeriasGestor from '@/components/custom/modalSolicitacao/modalFerias/modalGestor';

//Pagina sem nada, ajeitar para a integração de tudo
export default function Home() {

  const [usuarioNome, setUsuarioNome] = useState<string | undefined>();
  const [acessoCod, setAcessoCod] = useState<any>();
  const [usuarioInfo, setUsuarioInfo] = useState<any>();
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // Loading state

  useEffect(() => {
    getUser();
  }, []);

  const getUser = async () => {
    try {
      const user = await getUsuario();
      const usuario = user.data;
      setUsuarioNome(usuario.usuario_nome);
      setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
      setUsuarioInfo(usuario);
    } catch (error) {
      console.error("Error fetching user data", error);
    } finally {
      setIsLoading(false); // Set loading to false after data is fetched
    }
  };

  // Show loading message while fetching data
  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <>
      <div className='flex flex-col gap-10'>
        <h1 className='text-4xl font-semibold'>Olá, {usuarioNome}!</h1>
        <div>
          {acessoCod === 0 ? null : <InicioFuncionario />}
        </div>
      </div>
    </>
  );
}
