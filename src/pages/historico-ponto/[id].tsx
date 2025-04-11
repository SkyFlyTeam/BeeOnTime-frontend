"use client";

// General
import * as React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

// Interfaces
import MarcacaoPonto from "@/interfaces/marcacaoPonto";
import HistPonto from "@/interfaces/histPonto";
import { Usuario } from "@/interfaces/usuario";
import Horas from "@/interfaces/horas";

// Services
import { pontoServices } from "@/services/pontoServices";
import { horasServices } from "@/services/horasService";
import { getUsuario } from "@/services/authService";
import { usuarioServices } from "@/services/usuarioServices";

// Components
import { PointsHistoryTable } from "@/components/custom/histPonto/points-history-table";
import EditarFuncionarioForm from "@/components/custom/CardEditarFuncionario/editarFuncionarioForm";

// Styles


export default function PointsHistoryPage() {
  // Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER");
  const [histPontos, setHistPontos] = useState<HistPonto[] | null>(null);
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null);

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  const router = useRouter();
  const { id } = router.query;

  const handleEdit = (entry: HistPonto) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };

  // Função para combinar as horas e os pontos
  const fetchHistPontos = async (usuario_cod: number) => {
    try {
      const pontos = await pontoServices.getPontosByUsuario(usuario_cod) as MarcacaoPonto[];
      const horas = await horasServices.getHorasByUsuario(usuario_cod) as Horas[];

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
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod) as Usuario;
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
        fetchHistPontos(parseInt(id!.toString()));
        fetchUsuario(parseInt(id!.toString()));
      }
      setIsLoading(false); // Set loading to false after data is fetched
    };

    onMount();
  }, [id]); // Empty dependency array ensures the effect runs once after mount

  if (isLoading) {
    return <div>Carregando...</div>; // Show loading state while data is being fetched
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
