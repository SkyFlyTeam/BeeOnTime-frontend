import { DataTable } from "@/components/ui/datatable";
import { columns } from "./columns";
import { bancoHorasMensal } from "@/interfaces/bancoHoras";

export default function BancoHoras() {
    const dados: bancoHorasMensal[] = [
        {
            usuarioNome: "Karen de Cássia Gonçalves",
            totalHoras: 176,
            horasContratuais: 160,
            desconto: 4,
            horasAbonadas: 6,
            extrasPagas: 0,
            saldoAcumulado: 6,
        },
        {
            usuarioNome: "Sarah Montuani Batagioti",
            totalHoras: 200,
            horasContratuais: 180,
            desconto: 5,
            horasAbonadas: 10,
            extrasPagas: 15,
            saldoAcumulado: 10,
        },
        {
            usuarioNome: "Eric Lourenço Mendes",
            totalHoras: 190,
            horasContratuais: 180,
            desconto: 0,
            horasAbonadas: 10,
            extrasPagas: 10,
            saldoAcumulado: 10,
        },
        {
            usuarioNome: "Guilherme dos Santos",
            totalHoras: 205,
            horasContratuais: 180,
            desconto: 0,
            horasAbonadas: 20,
            extrasPagas: 15,
            saldoAcumulado: 25,
        },
        {
            usuarioNome: "Brenno Rosa Lyrio",
            totalHoras: 185,
            horasContratuais: 160,
            desconto: 4,
            horasAbonadas: 6,
            extrasPagas: 0,
            saldoAcumulado: 0,
        },
        {
            usuarioNome: "Arthur Johannes Reis",
            totalHoras: 176,
            horasContratuais: 160,
            desconto: 4,
            horasAbonadas: 6,
            extrasPagas: 0,
            saldoAcumulado: -6,
        }
    ];

    return(
        <div className="min-w-fit bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-4 rounded-xl p-6">
            <DataTable columns={columns} data={dados} filterColumns={["usuarioNome"]}/>
        </div>
    )
}