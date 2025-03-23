// src/components/ui/CadastroFormJornada.tsx
"use client";

import { cadastrarUsuarioComJornada } from "@/services/usuarioService";
import { ChangeEvent, useState } from "react";



export default function CadastroFormJornada({ formData, onClose }: { formData: any, onClose: () => void }) {
  
  const [jornadaData, setJornadaData] = useState({
    // horarioFlexivel: false,
    // entrada: "",
    // saida: "",
    usuario_cargaHoraria: "",
    // diasSemana: [false, false, false, false, false, false, false],
  });
  
  const handleSave = async () => {
    try {
      // Envia os dados combinados (do primeiro e segundo modal)
      await cadastrarUsuarioComJornada(formData, jornadaData);
      console.log("Cadastro concluído com sucesso!");
      onClose(); // Fecha o modal após o envio
    } catch (error) {
      console.error("Erro ao salvar os dados:", error);
    }
  };


  const handleJornadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // Apenas para o campo "cargaHoraria"
    setJornadaData({ ...jornadaData, [name]: value });
  };

  return (
    <form className="flex flex-col gap-4">
      {/* Horário Flexível */}
      <div className="flex items-center gap-8 ml-4">
        <label htmlFor="horarioFlexivel" className="mr-2">Horário Flexível</label>
        <div className="flex gap-8">
          <label className="flex items-center">
            <input
              type="radio"
              name="horarioFlexivel"
              value="true"
              // checked={jornadaData.horarioFlexivel === true}
              // onChange={(e) => handleJornadaChange(e)}
              className="w-5 h-5 mr-2"
            />
            Sim
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="horarioFlexivel"
              value="false"
              // checked={jornadaData.horarioFlexivel === false}
              // onChange={(e) => handleJornadaChange(e)}
              className="w-5 h-5 mr-2"
            />
            Não
          </label>
        </div>
      </div>

      {/* Entrada */}
      <div>
        <label htmlFor="entrada">Entrada</label>
        <input
          id="entrada"
          name="entrada"
          type="time"
          // value={jornadaData.entrada}
          // onChange={(e) => handleJornadaChange(e)}
          className="border p-2 rounded-md w-full"
          required
        />
      </div>

      {/* Saída */}
      <div>
        <label htmlFor="saida">Saída</label>
        <input
          id="saida"
          name="saida"
          type="time"
          // value={jornadaData.saida}
          // onChange={(e) => handleJornadaChange(e)}
          className="border p-2 rounded-md w-full"
          required
        />
      </div>

      {/* Carga Horária */}
      <div>
        <label htmlFor="usuario_cargaHoraria">Carga Horária</label>
        <input
          id="usuario_cargaHoraria"
          name="usuario_cargaHoraria"
          type="number"
          value={jornadaData.usuario_cargaHoraria}
          onChange={(e) => handleJornadaChange(e)}
          className="border p-2 rounded-md w-full"
          required
        />
      </div>

      {/* Dias da Semana (Tabela com checkboxes) */}
      <div>
        <label className="mb-2">Dias da Semana</label>
        <div className="grid grid-cols-7 gap-2">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia, index) => (
            <div key={index} className="text-center">
              <input
                type="checkbox"
                name={String(index)}
                // checked={jornadaData.diasSemana[index]}
                // onChange={(e) => handleJornadaChange(e)}
                className="w-5 h-5"
              />
              <div>{dia}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Botão de Salvar */}
      <button
        type="button"
        onClick={handleSave}
        className="bg-orange-400 text-white p-2 rounded-md"
      >
        Salvar
      </button>
    </form>
  );
}
