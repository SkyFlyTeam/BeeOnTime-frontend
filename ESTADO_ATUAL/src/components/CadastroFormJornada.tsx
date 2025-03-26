// src/components/ui/CadastroFormJornada.tsx
"use client";

import { cadastrarUsuarioComJornada } from "@/services/usuarioService";
import { ChangeEvent, useState } from "react";
import { toast, ToastContainer } from "react-toastify";

export default function CadastroFormJornada({ formData, onClose }: { formData: any, onClose: () => void }) {
  
  const [jornadaData, setJornadaData] = useState({
    horarioFlexivel: false,
    diasSemana: [false, false, false, false, false, false, false],
    horarioEntrada: "",
    horarioSaida: "",
    usuario_cargaHoraria: "",
    horarioAlmoco: "",
  });
  
  const [isSaving, setIsSaving] = useState(false); 

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Envia os dados combinados (do primeiro e segundo modal)
      await cadastrarUsuarioComJornada(formData, jornadaData);

      toast.success("Dados salvos com sucesso!", {
        position: "top-center", // Exibe o toast no topo centralizado
      });

      onClose(); // Fecha o modal após o envio
    } catch (error) {
      toast.error("Ocorreu um erro ao salvar os dados.", {
        position: "top-center",
      });
    }
    finally {
      setIsSaving(false);
    }
  };


  const handleJornadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
  
    // Apenas para o campo "cargaHoraria"
    setJornadaData({ ...jornadaData, [name]: value });
  };

  const handleDayClick = (index: number) => {
    const newDiasSemana = [...jornadaData.diasSemana];
    newDiasSemana[index] = !newDiasSemana[index]; // Alterna o estado do dia (marcado/desmarcado)
    setJornadaData({ ...jornadaData, diasSemana: newDiasSemana });
  };

  return (
    <div>
      <ToastContainer />
    
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

      {/* Entrada e saída  */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label htmlFor="horarioEntrada">Entrada</label>
          <input
            id="horarioEntrada"
            name="horarioEntrada"
            type="time"
            // value={jornadaData.entrada}
            // onChange={(e) => handleJornadaChange(e)}
            className="border p-2 rounded-md w-full"
            required
          />
        </div>
          <div className="flex-1">
            <label htmlFor="horarioSaida">Saída</label>
            <input
              id="horarioSaida"
              name="horarioSaida"
              type="time"
              // value={jornadaData.saida}
              // onChange={(e) => handleJornadaChange(e)}
              className="border p-2 rounded-md w-full"
              required
            />
          </div>
        </div>

        <div className="flex gap-4">
          {/* Carga Horária */}
          <div className="flex-1">
            <label htmlFor="usuario_cargaHoraria">Carga Horária Diária</label>
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

          <div className="flex-1">
            <label htmlFor="horarioAlmoco">Horário Almoço</label>
            <input
              id="horarioAlmoco"
              name="horarioAlmoco"
              type="time"
              // value={jornadaData.saida}
              // onChange={(e) => handleJornadaChange(e)}
              className="border p-2 rounded-md w-full"
              required
            />
          </div>
        </div>

      

      {/* Dias da Semana (Divs clicáveis com hover e click) */}
      <div>
          <label className="mb-2">Dias da Semana</label>
          <div className="flex gap-8 p-2 border rounded-lg w-full">
            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"].map((dia, index) => (
              <div
                key={index}
                className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-md transition-colors duration-200
                  ${jornadaData.diasSemana[index] ? "bg-blue-500 text-white" : "bg-white text-black"}`}
                onClick={() => handleDayClick(index)}
                onMouseEnter={(e) => e.currentTarget.classList.add('bg-gray-200')} // Muda a cor ao passar o mouse
                onMouseLeave={(e) => e.currentTarget.classList.remove('bg-gray-200')} // Volta à cor original
              >
                {dia}
              </div>
            ))}
          </div>
        </div>

      {/* Botão de Salvar */}
      <button
        type="button"
        onClick={handleSave}
        className="bg-orange-400 text-white p-2 rounded-md"
        disabled={isSaving}
      >
        Salvar
      </button>
    </form>
  </div>
  );
}
