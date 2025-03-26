import TimeClock from '@/components/time-clock';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';

export default function Page() {
  return (
    <>
    
      <h1 className='text-4xl font-semibold'>Tela Inicial</h1>
      <div className="grid auto-rows-min gap-4 md:grid-cols-3">
        <div className=" rounded-xl p-4 flex items-center justify-center ">
          <TimeClock />
        </div>
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>
      <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
    </>
  );
}