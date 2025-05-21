export default function FeriadoItem({dia, mes, nome, diasRestantes} : FeriadotemProps) {
    return (
        <div className="flex items-center gap-4">
            <div className="flex flex-col items-center  rounded-[16px] border-2 border-gray-300  w-12 h-12  overflow-hidden shadow-sm">
                <div className="bg-[#FFB503] w-full flex items-center justify-center py-[3px] ">
                    <span className="text-xs uppercase text-white font-bold leading-none">{mes}</span>
                </div>
                <div className="flex-grow flex items-center justify-center bg-white w-full">      
                    <span className="text-black text-lg font-bold leading-none">{dia}</span>
                </div>
            </div>
            <div className="flex flex-col">
                <span className="font-semibold">{nome}</span>
                <span className="text-gray-500 text-sm"> Em {diasRestantes} dias</span>
            </div>
        </div>
    )
}