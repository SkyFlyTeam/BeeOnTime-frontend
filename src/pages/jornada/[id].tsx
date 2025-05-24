"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";

// Services
import { usuarioServices } from "@/services/usuarioServices";
import { getRoleID, getUsuario } from "@/services/authService";

// Interfaces;
import { Usuario } from "@/interfaces/usuario";

// Components
import { Skeleton } from "@/components/ui/skeleton";
import EditarJornadaForm from "@/components/custom/CardEditarJornada/editarJornadaForm";
import { useRouter } from "next/router";


export default function JornadaPage() {
  //Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER")
  const [isLoading, setIsLoading] = useState(true); //Estado controle de carregamento
  const [usuarioLogado, setUsuarioLogado] = useState<Usuario | null>();
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>();


  const router = useRouter();
  const { id } = router.query;

  const getUser = async () => {
    const user = await getUsuario();
    return user.data;
  };
  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod) as Usuario;
      //alert(JSON.stringify(usuario_data))
      setUsuarioInfo(usuario_data);
      return {
        usuario_cod: usuario_data.usuario_cod,
        setorCod: usuario_data.setor.setorCod,
        nivelAcesso_cod: usuario_data.nivelAcesso.nivelAcesso_cod,
      };
    } catch (error) {
      console.log("Erro ao recuperar usuário de id " + usuario_cod);
      return null;
    }
  };

  // Utilize useEffect para chamar a função quando o componente for montado
  useEffect(() => {
    const onMount = async () => {
      // Verifique se id está disponível antes de continuar
      if (!id)
        return;


      const usuario = await getUser();
      setUsuarioLogado(usuario);


      if (usuario.nivelAcesso.nivelAcesso_cod == 2) {
        setUsuarioInfo(usuario);
        return;
      }


      const usuarioId = await fetchUsuario(parseInt(id.toString()));
      if (!usuarioId)
        return;

      if (
        (usuarioId.setorCod != usuario.setor.setorCod && usuario.nivelAcesso.nivelAcesso_cod != 0) ||
        (usuarioId.nivelAcesso_cod < usuario.nivelAcesso.nivelAcesso_cod)
      )
        return;

      setAccessLevel("ADM");
    };

    onMount();
    if (id)
      setIsLoading(false); // Set loading to false after data is fetched
  }, [id]); // Empty dependency array ensures the effect runs once after mount



  if (!usuarioLogado || !usuarioInfo)
    return;

  if (
    (usuarioInfo.setor.setorCod != usuarioLogado.setor.setorCod && usuarioLogado.nivelAcesso.nivelAcesso_cod != 0) ||
    (usuarioInfo.nivelAcesso.nivelAcesso_cod < usuarioLogado.nivelAcesso.nivelAcesso_cod) ||
    (usuarioInfo.usuario_cod == usuarioLogado.usuario_cod)
  )
    return;


  if (isLoading) {
    return (
      <div className="flex flex-col  p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho"}
        </h1>
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
          <div className="flex flex-row wrap justify-between">
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
    <>
      <div className="flex flex-col  p-6 md:p-9">
        <h1 className="text-xl md:text-3xl font-semibold mb-4">
          {accessLevel === "USER" ? "Jornada de Trabalho" : "Jornada de Trabalho - " + usuarioInfo.usuario_nome}
        </h1>
        {accessLevel === "ADM" && usuarioInfo ?
          <EditarJornadaForm
            usuarioInfo={usuarioInfo}
            logadoInfo={
              {
                usuario_cod: usuarioLogado.usuario_cod,
                setorCod: usuarioLogado.setor.setorCod,
                nivelAcesso_cod: usuarioLogado.nivelAcesso.nivelAcesso_cod,
              }
            }

          /> : null}
      </div>
    </>
  );
}