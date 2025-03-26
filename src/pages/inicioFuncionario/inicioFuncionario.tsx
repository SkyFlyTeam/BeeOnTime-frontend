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

export default function InicioFuncionario() {
  return (
    <>
    
      <h1 className='text-4xl font-semibold'>Olá, Seja Bem-Vindo</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className=" rounded-xl p-4 flex items-center justify-center ">
          <TimeClock />
        </div>
      </div>
    </>
  );
}