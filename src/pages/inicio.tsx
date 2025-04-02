import TimeClock from '@/pages/inicioFuncionario/_components/time-clock';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';
import { getUsuario } from '@/services/authService';
import { set } from 'react-hook-form';
import InicioFuncionario from './inicioFuncionario';
import CardCargaHoraria from '@/components/custom/cardCargaHoraria';
import UsuarioInfo from '@/interfaces/usuarioInfo';
import EditarFuncionarioForm from '@/components/custom/CardEditarFuncionario/editarFuncionarioForm';

//Pagina sem nada, ajeitar para a integração de tudo
export default function Page() {

  const [usuarioNome, setUsuarioNome] = useState<string | undefined>();
  const [acessoCod, setAcessoCod] = useState<any>();
  const [usuarioInfo, setUsuarioInfo] = useState<any>();
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
      <div className='flex flex-col gap-7'>
        <h1 className='text-4xl font-semibold'>Olá, {usuarioNome}!</h1>
        <div>
          {acessoCod === 0 ? null : <InicioFuncionario />}
        </div>
        <div>
          {acessoCod === 0 ? null : <CardCargaHoraria usuarioInfo={usuarioInfo!} />}
        </div>
      </div>
    </>
  );
}
