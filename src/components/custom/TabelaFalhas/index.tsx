import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import Atraso from "@/interfaces/atraso";

interface tabelaFalhas {
    atrasos: Atraso[]
}

export default function TabelaFalhas({atrasos}: tabelaFalhas){
    const formatarData = (data: any) => {
        let partesData = data.split("-")
        let dataFormatada = partesData[2] + "/" + partesData[1] + "/" + partesData[0]
        return dataFormatada
    }

    const formatarHoras = (horas: any) => {
        let partesHoras = horas.split(":")
        let horasFormatada = `${partesHoras[0]}:${partesHoras[1]}`
        return horasFormatada
    }

    const converterAtrasoParaHorasMinutos = (atrasoTempo: any) => {
        const horas = Math.floor(atrasoTempo);  
        const minutos = Math.round((atrasoTempo - horas) * 60);  
    
        return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`
    }

    return(
        <Table className="overflow-x-auto">
            <TableHeader>
                <TableRow>
                    {["NOME", "DATA", "HORÁRIO ESPERADO", "HORÁRIO DE ENTRADA", "CONTAGEM DE ATRASO"].map((header, idx) => (
                    <TableHead
                        key={idx}
                        className="border border-gray-200 text-center font-bold text-black text-base p-4"
                    >
                        {header}
                    </TableHead>
                    ))}
                </TableRow>
            </TableHeader>
            <TableBody>
                {atrasos.length > 0 && (
                    atrasos.map((atraso, index) => (
                        <TableRow
                            key={index}
                            className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                        >
                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{atraso.horas.usuarioNome}</TableCell>
                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarData(atraso.horas.horasData)}</TableCell>
                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarHoras(atraso.horas.horarioBatida)}</TableCell>
                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarHoras(atraso.horas.jornada_horarioEntrada)}</TableCell>
                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{converterAtrasoParaHorasMinutos(atraso.atrasoTempo)}</TableCell>
                        </TableRow>
                    ))
                )}
            </TableBody>
        </Table>
    )
}