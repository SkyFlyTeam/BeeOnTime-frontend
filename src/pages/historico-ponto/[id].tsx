"use client";

import * as React from "react";
import { PointsHistoryTable } from "@/components/custom/histPonto/points-history-table";
import { useState, useEffect } from "react";
import HistPontos, { Ponto } from "@/interfaces/hisPonto";
import { pontoServices } from "@/services/pontoServices";
import { horasServices } from "@/services/horasServices";
import RelatorioPonto from "@/interfaces/relatorioPonto";
import { usuarioServices } from "@/services/usuarioServices";
import { Usuario } from "@/interfaces/usuario";
import { getUsuario } from "@/services/authService";

import { useRouter } from "next/router";
import EditarFuncionarioForm from "@/components/custom/CardEditarFuncionario/editarFuncionarioForm";
import { Skeleton } from "@/components/ui/skeleton";

export default function PointsHistoryPage() {
  // Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER");
  const [histPontos, setHistPontos] = useState<RelatorioPonto[] | null>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  const handleEdit = (entry: RelatorioPonto) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };

  // Função para combinar as horas e os pontos
  const fetchHistPontos = async (usuario_cod: number) => {
    try {
      const pontos = await pontoServices.getPontosByUsuario(usuario_cod);
      const horas = await horasServices.getHorasByUsuario(usuario_cod);

      const combinedData = pontos.map((ponto: any) => {
        const hora = horas.find((hora: any) => hora.horasCod === ponto.horasCod);

        return {
          ...ponto,
          horasExtras: hora?.horasExtras || 0,
          horasTrabalhadas: hora?.horasTrabalhadas || 0,
          horasNoturnas: hora?.horasNoturnas || 0,
          horasFaltantes: hora?.horasFaltantes || 0,
          horasData: hora?.horasData || "",
          usuarioCod: hora?.usuarioCod || 0,
        };
      });

      setHistPontos(combinedData);
    } catch (error) {
      console.log("Erro ao recuperar histórico de pontos do usuário de id " + usuario_cod);
    }
  };

  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod);
      setUsuarioInfo(usuario_data);
    } catch (error) {
      console.log("Erro ao recuperar usuário de id " + usuario_cod);
    }
  };

  const getUser = async () => {
    const user = await getUsuario();
    return user.data;
  };

  useEffect(() => {
    const onMount = async () => {
      const usuario = await getUser();

      if (usuario.nivelAcesso.nivelAcesso_cod == 2) {
        fetchHistPontos(usuario.usuario_cod);
        fetchUsuario(usuario.usuario_cod);
      } else {
        setAccessLevel("ADM");
        if (id)
          fetchHistPontos(parseInt(id!.toString()));
        fetchUsuario(parseInt(id!.toString()));
      }
      setIsLoading(false); // Set loading to false after data is fetched
    };

    onMount();
  }, []); // Empty dependency array ensures the effect runs once after mount

  const SkeletonRow = () => (
    <div className="flex flex-row gap-7 mt-10 justify-between">
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-72 h-10" />
      <Skeleton className="bg-gray-200 w-48 h-10" />
      <Skeleton className="bg-gray-200 w-32 h-10" />
    </div>
  );
  if (isLoading) {
    return (
      <div className="p-6 md:p-9">
        <Skeleton className=" bg-gray-200 h-10 w-48" />
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          <div className="flex flex-row gap-6 justify-between">
            <Skeleton className="bg-gray-200 w-80 h-10" />
            <Skeleton className="bg-gray-200 w-96 h-10" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}


        </div>
      </div>
    ); // Show loading state while data is being fetched
  }

  return (
    <div className="flex flex-col p-6 md:p-9">
      {/* {accessLevel == "ADM" ? <EditarFuncionarioForm usuarioInfo={usuarioInfo!} /> : null} */}
      <h1 className="text-xl md:text-3xl font-semibold mb-4">
        {accessLevel === "USER" ? "Meus Pontos" : `Pontos de ${usuarioInfo?.usuario_nome}`}
      </h1>
      <PointsHistoryTable
        entries={histPontos}
        userInfo={usuarioInfo}
        onEdit={handleEdit}
        accessLevel={accessLevel}
      />
    </div>
  );
}
