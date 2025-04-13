"use client"

// Interfaces
import { bancoHorasMensal } from "@/interfaces/bancoHoras"

// Componentes
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons";

const formatStringToHour = (value: string) => {
  return `${value}h`
}

export const columns: ColumnDef<bancoHorasMensal>[] = [
  {
    accessorKey: "usuarioNome",
    header: "Nome",
  },
  {
    accessorKey: "totalHoras",
    header: "Total Horas",
    cell: ({ row }) => {
      let value = row.getValue("totalHoras") as string;
      return <div className="text-center">{formatStringToHour(value)}</div>
    }
  },
  {
    accessorKey: "horasContratuais",
    header: "Horas Contratuais",
    cell: ({ row }) => {
      let value = row.getValue("horasContratuais") as string;
      return <div className="text-center">{formatStringToHour(value)}</div>
    }
  },
  {
    accessorKey: "desconto",
    header: "Desconto",
    cell: ({ row }) => {
      let value = row.getValue("desconto") as string;
      return <div className="text-center">{formatStringToHour(value)}</div>
    }
  },
  {
    accessorKey: "horasAbonadas",
    header: "Horas Abonadas",
    cell: ({ row }) => {
      let value = row.getValue("horasAbonadas") as string;
      return <div className="text-center">{formatStringToHour(value)}</div>
    }
  },
  {
    accessorKey: "extrasPagas",
    header: "Extras Pagas",
    cell: ({ row }) => {
      let value = row.getValue("extrasPagas") as string;
      return <div className="text-center">{formatStringToHour(value)}</div>
    }
  },
  {
    accessorKey: "saldoAcumulado",
    header: "Saldo Acomulado",
    cell: ({ row }) => {
      let value = row.getValue("saldoAcumulado") as number;
      let formattedValue
      if (value > 0){ formattedValue = `+${value}h`}
      else{ formattedValue = `${value}h`}
      return <div className="text-center">{formattedValue}</div>
    }
  },
  {
    id: "Ações",
    header: "Ações",  
    cell: ({ row }) => (
      <div className="flex space-x-2 justify-center">
        <Button> <FontAwesomeIcon icon={faEye} className="text-black-600"/></Button>
      </div>
    ),
  },
]