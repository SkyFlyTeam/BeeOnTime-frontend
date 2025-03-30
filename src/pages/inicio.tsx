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


//Pagina sem nada, ajeitar para a integração de tudo
export default function Page() {

  const [usuarioNome, setUsuarioNome] = useState<string>();

  useEffect(() => {
    getUser()
  }, [])

  const getUser = async() => {
    const user = await getUsuario();
    console.log (user);
    const usuario = user.data;
    setUsuarioNome(usuario.usuario_nome);
  }

  return (
    <>
    
      <h1 className='text-4xl font-semibold'>Olá, {usuarioNome}!</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className=" rounded-xl p-4 flex items-center justify-center ">
        </div>
      </div>
    </>
  );
}