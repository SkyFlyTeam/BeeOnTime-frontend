import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/listagem";
import Atraso from "@/interfaces/atraso";

interface TabelaFalhas {
  atrasos: Atraso[];
}

export default function TabelaFalhas({ atrasos }: TabelaFalhas) {
  const formatarData = (data: any) => {
    if (!data) {
        return ''
    }
    let partesData = data.split("-");
    let dataFormatada = partesData[2] + "/" + partesData[1] + "/" + partesData[0];
    return dataFormatada;
  };

  const formatarHoras = (horas: any) => {
    if (!horas) {
        return ''
    }
    let partesHoras = horas.split(":");
    let horasFormatada = `${partesHoras[0]}:${partesHoras[1]}`;
    return horasFormatada;
  };

  const converterAtrasoParaHorasMinutos = (atrasoTempo: any) => {
    const horas = Math.floor(atrasoTempo);
    const minutos = Math.round((atrasoTempo - horas) * 60);

    return horas > 0 ? `${horas}h ${minutos}min` : `${minutos}min`;
  };

  return (
    <div className="overflow-x-auto">
      {/* Layout para telas grandes */}
        <div className="hidden md:block">
            <Table className="w-full">
                <TableHeader>
                    <TableRow>
                    {["NOME", "DATA", "HORÁRIO ESPERADO", "HORÁRIO DE ENTRADA", "CONTAGEM DE ATRASO"].map((header, idx) => (
                        <TableHead key={idx} className="border border-gray-200 text-center font-bold text-black text-base p-4">
                        {header}
                        </TableHead>
                    ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {atrasos.length > 0 &&
                    atrasos.map((atraso, index) => (
                        <TableRow key={index} className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}>
                        <TableCell className="border border-gray-200 text-center text-black text-base p-3">{atraso.horas.usuarioNome}</TableCell>
                        <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarData(atraso.horas.horasData)}</TableCell>
                        <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarHoras(atraso.horas.horarioBatida)}</TableCell>
                        <TableCell className="border border-gray-200 text-center text-black text-base p-3">{formatarHoras(atraso.horas.jornada_horarioEntrada)}</TableCell>
                        <TableCell className="border border-gray-200 text-center text-black text-base p-3">{converterAtrasoParaHorasMinutos(atraso.atrasoTempo)}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>

        {/* Layout para dispositivos móveis */}
        <div className="overflow-x-auto block md:hidden">
            <Table className="w-full">
                <TableBody>
                {["Nome", "Data", "Horário Esperado", "Horário de Entrada", "Contagem de Atraso"].map((atributo, idx) => (
                    <TableRow key={idx}>
                    <TableCell className="border border-gray-200 text-left text-black text-base p-3 font-bold">
                        {atributo}
                    </TableCell>
                    {atrasos.map((atraso, index) => {
                        let valor;
                        switch (atributo) {
                        case "Nome":
                            valor = atraso.horas.usuarioNome;
                            break;
                        case "Data":
                            valor = formatarData(atraso.horas.horasData);
                            break;
                        case "Horário Esperado":
                            valor = formatarHoras(atraso.horas.horarioBatida);
                            break;
                        case "Horário de Entrada":
                            valor = formatarHoras(atraso.horas.jornada_horarioEntrada);
                            break;
                        case "Contagem de Atraso":
                            valor = converterAtrasoParaHorasMinutos(atraso.atrasoTempo);
                            break;
                        default:
                            valor = "";
                        }
                        return (
                        <TableCell
                            key={index}
                            className={`${index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"} border border-gray-200 text-left text-black text-base p-3`}
                            >
                                {valor}
                            </TableCell>
                        );
                    })}
                    </TableRow>
                ))}
                </TableBody>
            </Table>
        </div>
    </div>
  );
}
