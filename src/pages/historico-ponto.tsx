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
import { EditarColaborador } from "@/components/custom/EditarColaborador/editarColaborador";


export default function PointsHistoryPage() {
  //Simulando o diferente acesso
  const [accessLevel, setAccessLevel] = useState<"USER" | "ADM">("USER")
  const [histPontos, setHistPontos] = useState<RelatorioPonto[] | null>(null)
  const [usuarioInfo, setUsuarioInfo] = useState<Usuario | null>(null)

  // const { usuarioCargo, usuarioCod } = useAuth(); 

  const handleEdit = (entry: RelatorioPonto) => {
    // Lógica para editar a entrada (ex.: abrir um modal)
    console.log("Editar entrada:", entry);
  };

  // Função para combinar as horas e os pontos
  const fetchHistPontos = async (usuario_cod: number) => {
    try {
      // Buscar os pontos do usuário
      const pontos = await pontoServices.getPontosByUsuario(usuario_cod);
      // Buscar as horas do usuário
      const horas = await horasServices.getHorasByUsuario(usuario_cod);

      // Combinar as informações pelo 'horasCod'
      const combinedData = pontos.map((ponto: any) => {
        // Encontrar o item correspondente de horas baseado no 'horasCod'
        const hora = horas.find((hora: any) => hora.horasCod === ponto.horasCod);

        return {
          ...ponto,
          horasExtras: hora?.horasExtras || 0,
          horasTrabalhadas: hora?.horasTrabalhadas || 0,
          horasNoturnas: hora?.horasNoturnas || 0,
          horasFaltantes: hora?.horasFaltantes || 0,
          horasData: hora?.horasData || '',
          usuarioCod: hora?.usuarioCod || 0,
        };
      });

      // Atualizar o estado com os dados combinados
      setHistPontos(combinedData);
    } catch (error) {
      console.log("Erro ao recuperar histórico de pontos do usuário de id " + usuario_cod);
    }
  };

  const fetchUsuario = async (usuario_cod: number) => {
    try {
      const usuario_data = await usuarioServices.getUsuarioById(usuario_cod);
      setUsuarioInfo(usuario_data)
    } catch (error) {
      console.log("Erro ao recuperar usuário de id " + usuario_cod);
    }
  };

  const getUser = async () => {
    const user = await getUsuario();
    console.log(user);
    return user.data;
  }

  // Utilize useEffect para chamar a função quando o componente for montado
  useEffect(() => {

    const onMount = async () => {
      const usuario = await getUser();

      if (usuario.nivelAcesso.nivelAcesso_cod !== 0) {
        fetchHistPontos(usuario.usuario_cod);
        fetchUsuario(usuario.usuario_cod);
      }
      else {
        setAccessLevel('ADM')
      }
    }

    onMount()

  }, []);

  return (
    <div className="flex flex-col  p-6 md:p-9">
      <div>
        <h1>
          <EditarColaborador />
        </h1>

      </div>
      <h1 className="text-xl md:text-3xl font-semibold mb-4">
        {accessLevel === "USER" ? "Meus Pontos" : "Pontos"}
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