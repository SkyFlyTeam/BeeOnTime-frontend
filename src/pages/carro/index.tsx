import { DataTable } from '@/src/components/ui/datatable';
import { useRouter } from 'next/router';

import { columns, Payment } from './columns'

export default function Carro() {
    const router = useRouter();

    const data: Payment[] = [
        {
          id: "m5gr84i9",
          amount: 316,
          status: "success",
          email: "ken99@example.com",
        },
        {
          id: "3u1reuv4",
          amount: 242,
          status: "success",
          email: "Abe45@example.com",
        },
        {
          id: "derv1ws0",
          amount: 837,
          status: "processing",
          email: "Monserrat44@example.com",
        },
        {
          id: "5kma53ae",
          amount: 874,
          status: "success",
          email: "Silas22@example.com",
        }
    ]      

    return(
        <div>
            <h1>Carros</h1>
            <DataTable data={data} columns={columns}></DataTable>
        </div>
    )
}