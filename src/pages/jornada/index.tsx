"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";

// Services
import { usuarioServices } from "@/services/usuarioServices";
import { getUsuario } from "@/services/authService";

// Interfaces;
import { Usuario } from "@/interfaces/usuario";

// Components
import { Skeleton } from "@/components/ui/skeleton";
import EditarJornadaForm from "@/components/custom/CardEditarJornada/editarJornadaForm";


export default function PointsHistoryPage() {
    //Simulando o diferente acesso
    const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER")
    const [loading, setLoading] = useState(true); //Estado controle de carregamento
    const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>();

    const getUser = async () => {
        try {
            const usuario_data = await getUsuario();
            return usuario_data.data;
        }
        catch (error){
            return 0;
        }
    }

    // Utilize useEffect para chamar a função quando o componente for montado
    useEffect(() => {

        const onMount = async () => {
            const usuario = await getUser();
            setUsuarioInfo(usuario);
            setAccessLevel(usuario.nivelAcesso_cod == 0 ? "ADM" : "USER")
            setLoading(false);
        }

        onMount();
      }, []); // Empty dependency array ensures the effect runs once after mount





    if (loading) {
        return (
            <div className="flex flex-col  p-6 md:p-9">
                <h1 className="text-xl md:text-3xl font-semibold mb-4">
                    {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho"}
                </h1>
                <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
                    {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
                    <div className="flex flex-row wrap justify-right">
                        <Skeleton className="bg-gray-200 w-80 h-14" />
                        <Skeleton className="bg-gray-200 w-32 h-14" />
                        <Skeleton className="bg-gray-200 w-32 h-14" />
                        <Skeleton className="bg-gray-200 w-32 h-14" />
                        <Skeleton className="bg-gray-200 w-96 h-14" />
                    </div>
                </div>
            </div>
        )
    }
    return (
        <div className="flex flex-col  p-6 md:p-9">
            <h1 className="text-xl md:text-3xl font-semibold mb-4">
                {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho"}    
                {accessLevel === "ADM" && usuarioInfo ?
                     <EditarJornadaForm usuarioInfo={usuarioInfo} /> : null}
            </h1>
        </div>
    );
}