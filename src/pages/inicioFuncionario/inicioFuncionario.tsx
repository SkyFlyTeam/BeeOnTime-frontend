import TimeClock from '@/pages/inicioFuncionario/components/time-clock';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

//Página fictícia só para ver

let nome = "José" // só de exemplo, depois pegará do back o nome
export default function InicioFuncionario() {
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