import Flag from "@/components/custom/flag"

export const CardLegenda = () => {

    return(
        <>
            <div className="flex w-full flex-col gap-4 bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] rounded-xl p-6">
                <h1 className="md:text-xl text-lg font-semibold self-center">Legenda Calendário</h1>
                <div className="flex justify-between">
                    <Flag status="Férias" />
                    <Flag status="Folga" />
                    <Flag status="Ausência" />
                    <Flag status="Feriado" />
                </div>
            </div>
        </>
    )
}