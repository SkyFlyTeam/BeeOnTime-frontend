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


//Pagina sem nada, ajeitar para a integração de tudo
export default function Page() {

  const [usuarioNome, setUsuarioNome] = useState<string>();
  const [acessoCod, setAcessoCod] = useState<any>();
  const [usuarioInfo, setUsuarioInfo] = useState<any>()

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async() => {
    const user = await getUsuario();
    console.log (user);
    const usuario = user.data;
    setUsuarioNome(usuario.usuario_nome);
    setAcessoCod(user.data.nivelAcesso.nivelAcesso_cod)
    setUsuarioInfo(user.data)
  }

  return (
    <>
      <div className='flex flex-col gap-10'>
        <h1 className='text-4xl font-semibold'>Olá, {usuarioNome}!</h1>
          <div>
            { acessoCod == 0 ? (null) : (<InicioFuncionario />)}
          </div>
          <div>
            { acessoCod == 0 ? (null) : (null)}
          </div>
      </div>
    </>
  );
}