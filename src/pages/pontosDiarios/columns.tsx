import Flag from "@/components/custom/flag";
import { PontoDiario } from "@/interfaces/pontoDiario";
import { ColumnDef } from "@tanstack/react-table";

export const columnsPontoDiario: ColumnDef<PontoDiario>[] = [
    {
        accessorKey: "nome",
        header: "NOME",
    },
    {
        accessorKey: "status",
        header: "STATUS",
        cell: ({ row }) => {
            const status = row.getValue("status") as string;
            const retorno = row.original.retorno;

            return (
                <div className="flex flex-col items-center text-center">
                    <Flag status={status} />
                    {!["Presente", "Ausência"].includes(status) && retorno && (
                        <span className="text-xs text-gray-500 mt-1">Retorno: {retorno}</span>
                    )}
                </div>
            );
        }
    },

    {
        accessorKey: "contratacao",
        header: "CONTRATAÇÃO"
    },
    {
        accessorKey: "jornada",
        header: "JORNADA",
        cell: ({ row }) => row.getValue("jornada") || "-"
    },
    {
        accessorKey: "entrada",
        header: "ENTRADA",
        cell: ({ row }) => row.getValue("entrada") || "-"
    },
    {
        accessorKey: "saida",
        header: "SAÍDA",
        cell: ({ row }) => row.getValue("saida") || "-"
    },
    {
      id: "intervalo",
        header: "INTERVALO",
        cell: ({ row }) => {
            const inicio = row.original.intervaloInicio;
            const volta = row.original.intervaloVolta;

            if (!inicio || !volta || inicio === "-" || volta === "-") {
                return "-";
            }

            return `${inicio} - ${volta}`;
        }
    }
];