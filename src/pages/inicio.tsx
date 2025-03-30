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

//Pagina sem nada, ajeitar para a integração de tudo
export default function Page() {
  return (
    <>
    
      <h1 className='text-4xl font-semibold'>Olá, ... !</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className=" rounded-xl p-4 flex items-center justify-center ">
        </div>
      </div>
    </>
  );
}