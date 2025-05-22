import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ausenciaDado {
    ausenciaDado: Record<string, number>
    titulo: string
}

export default function TabelaAusencia({ ausenciaDado, titulo }: ausenciaDado) {
    return (
        <>
            {Object.entries(ausenciaDado).length > 0 && (
                <div className="overflow-x-auto w-full">
                    <div className="w-full">
                        <Table className="w-full table-auto">
                            <TableHeader>
                                <TableRow>
                                    {["NOME", `${titulo}`].map((header, idx) => (
                                        <TableHead
                                            key={idx}
                                            className="border border-gray-200 text-center font-semibold text-black text-xs sm:text-sm md:text-base px-2 py-1 break-words"
                                            style={{ minWidth: idx === 0 ? '180px' : '40px' }}
                                        >
                                            {header.toUpperCase()}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {Object.entries(ausenciaDado).map(([nome, qtd], index) => (
                                    <TableRow
                                        key={index}
                                        className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                                    >
                                        <TableCell className="border border-gray-200 text-center text-black text-xs sm:text-sm md:text-base px-2 py-1 break-words">
                                            {nome.split(' ')[0]}
                                        </TableCell>
                                        <TableCell className="border border-gray-200 text-center text-black text-xs sm:text-sm md:text-base px-2 py-1 break-words">
                                            {qtd}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            )}
        </>
    );
}