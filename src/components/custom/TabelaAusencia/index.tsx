import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ausenciaDado {
    ausenciaDado: Record<string, number>
    titulo: string
}

export default function TabelaAusencia({ausenciaDado, titulo}: ausenciaDado){

    return(
        <>
            {Object.entries(ausenciaDado).length > 0 && (
                <div className="overflow-x-auto">
                    <div className="hidden md:block">
                        <Table className="w-6">
                            <TableHeader>
                                <TableRow>
                                    {["NOME", `${titulo}`].map((header, idx) => (
                                        <TableHead 
                                            key={idx} 
                                            className={`border border-gray-200 text-center font-bold text-black text-basepx-10 py-0`}
                                            style={{ minWidth: idx === 0 ? '160px' : '160px' }}
                                        >
                                                {header.toUpperCase()}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                    {Object.entries(ausenciaDado).map((funcionario: any, index) => (
                                        <TableRow key={index} className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"} >
                                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{funcionario[0].split(' ')[0]}</TableCell>
                                            <TableCell className="border border-gray-200 text-center text-black text-base p-3">{funcionario[1]}</TableCell>
                                        </TableRow>
                                    ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </>
    )
}