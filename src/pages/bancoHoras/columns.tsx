"use client"

// Interfaces
import { bancoHorasDiarioFunc, bancoHorasMensalAdmin, bancoHorasMensalFunc } from "@/interfaces/bancoHoras"

// Componentes
import { Button } from "@/components/ui/button"
import { ColumnDef } from "@tanstack/react-table"

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { faEye } from "@fortawesome/free-solid-svg-icons";

const formatStringToHour = (value: string) => {
  return `${value}h`
}

export const columnsAdmin: ColumnDef<bancoHorasMensalAdmin>[] = [
  {
    accessorKey: "usuarioCod", 
    header: "Usuário Cod",  
    cell: () => null, 
    enableHiding: false
  },
  {
    accessorKey: "dataMes", 
    header: "dataMes",  
    cell: () => null, 
    enableHiding: false,
    meta: {
      hidden: true,  
    }
    
  },
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
      if(value){
        return <div className="text-center">{formatStringToHour(value)}</div>
      }else{
        return <div className="text-center">-</div>
      }
      
    }
  },
  {
    accessorKey: "desconto",
    header: () => (
      <div className="justify-center flex gap-1 desconto"><span>Desconto</span><span className="text-red-500">*</span></div>
    ),
    cell: ({ row }) => {
      let value = row.getValue("desconto") as string;
      return <div className="text-center desconto">{formatStringToHour(value)}</div>
    },
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

export const columnsFunc: ColumnDef<bancoHorasMensalFunc>[] = [
  {
    accessorKey: "usuarioCod", 
    header: "Usuário Cod",  
    cell: () => null, 
    meta: {
      hidden: true,  
    },
    enableHiding: false
  },
  {
    accessorKey: "mesAno",
    header: "Mês/Ano",
    cell: ({ row }) => {
      let value = row.getValue("mesAno") as string;
      let date = new Date(value);
      const formattedDate = `${date.toLocaleDateString('pt-BR', { month: 'long' })}/${date.getFullYear().toString().slice(2,4)}`
      return <div className="text-center capitalize">{formattedDate}</div>
    }
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
      if(value){
        return <div className="text-center">{formatStringToHour(value)}</div>
      }else{
        return <div className="text-center">-</div>
      }
      
    }
  },
  {
    accessorKey: "desconto",
    header: () => (
      <div className="justify-center flex gap-1 desconto"><span>Desconto</span><span className="text-red-500">*</span></div>
    ),
    cell: ({ row }) => {
      let value = row.getValue("desconto") as string;
      return <div className="text-center capitalize desconto">{formatStringToHour(value)}</div>
    },
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

export const columnsDaily: ColumnDef<bancoHorasDiarioFunc>[] = [
  {
    accessorKey: "data",
    header: "Data",
    cell: ({ row }) => {
      let value = row.getValue("data") as string;
      const dateParts = value.split('-');
  
      const date = new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2]), 1, 0, 0, 0);
      const formattedDate = new Intl.DateTimeFormat('pt-BR').format(date)
      return <div className="text-center capitalize">{formattedDate}</div>
    }
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
      if(value){
        return <div className="text-center">{formatStringToHour(value)}</div>
      }else{
        return <div className="text-center">-</div>
      }
      
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
  }
]