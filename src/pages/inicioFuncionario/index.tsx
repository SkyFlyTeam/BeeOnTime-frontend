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
import { string } from 'zod';
import { getUsuario } from '@/services/authService';

export default function InicioFuncionario() {

    useEffect(() => {
      getUser()
    }, [])
  
    const getUser = async() => {
      const user = await getUsuario();
      console.log (user);
      const usuario = user.data;
      setNome(usuario.usuario_nome);
    }

  //Página fictícia só para ver
  const [nome, setNome] = useState("José");

  return (
    <>
    
      <h1 className='text-4xl px-6 md:px-6 font-semibold  text-center md:text-left'>Olá, {nome}!</h1>
      <div >
        <div className=" rounded-xl p-5 md:px-7 flex items-center ">
          <TimeClock />
        </div>
      </div>
    </>
  );
}