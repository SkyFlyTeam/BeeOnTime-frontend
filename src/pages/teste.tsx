import { Skeleton } from "@/components/ui/skeleton";
import React, { useEffect, useState } from "react";

type Dados = {
  imagem: string;
  titulo: string;
  descricao: string;
};

export default function Teste() {
  const [data, setData] = useState<Dados | null>(null); // <- tipagem correta aqui
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula uma requisição com delay de 5 segundos
    setTimeout(() => {
      const dadosSimulados: Dados = {
        imagem: "https://via.placeholder.com/250x125",
        titulo: "Título do Conteúdo",
        descricao: "Essa é a descrição simulada depois do loading.",
      };

      setData(dadosSimulados);
      setLoading(false);
    }, 5000);
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col space-y-3">
        <Skeleton className="h-[125px] w-[250px] rounded-xl bg-gray-200" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[200px] bg-gray-200" />
          <Skeleton className="h-4 w-[350px] bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <img
        src={data?.imagem}
        alt="Imagem carregada"
        className="h-[125px] w-[250px] rounded-xl"
      />
      <h2 className="text-lg font-bold mt-2">{data?.titulo}</h2>
      <p className="text-sm text-gray-700">{data?.descricao}</p>
    </div>
  );
}
