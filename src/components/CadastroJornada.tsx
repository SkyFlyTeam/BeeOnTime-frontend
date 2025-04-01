import { z } from "zod";
import { ChangeEvent, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { usuarioServices } from "@/services/usuarioService";
import UsuarioInfo, { Jornada } from "@/interfaces/usuarioInfo";

// Definindo o schema de validação para o formulário
const jornadaSchema = z.object({
  horarioFlexivel: z.boolean().refine(val => val !== undefined, {
    message: "Campo obrigatório",
  }),
  diasSemana: z.array(z.boolean()).refine(dias => dias.some(dia => dia), {
    message: "Pelo menos um dia da semana deve ser selecionado",
  }),
  usuario_cargaHoraria: z.string().min(1, "Campo obrigatório").optional(),
});

export default function CadastroJornada({ formData, onClose, onSave }: { formData: any, onClose: () => void,  onSave: (sucess: boolean) => void }) {
  const [jornadaData, setJornadaData] = useState({
    horarioFlexivel: false,
    diasSemana: [false, false, false, false, false, false, false],
    horarioEntrada: "",
    horarioSaida: "",
    usuario_cargaHoraria: "",
    horarioAlmoco: "",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [formErrors, setFormErrors] = useState<any>({});

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    // Validando os dados com Zod
    const result = jornadaSchema.safeParse(jornadaData);

    // Se a validação falhar, atualize os erros
    if (!result.success) {
      const errors = result.error.format();
      setFormErrors(errors);  // Armazena os erros de validação
      return; // Não avançar para o backend
    }

    try {
      // Envia os dados combinados (do primeiro e segundo modal)
      console.log("Dados enviados para o backend:", formData, jornadaData);
      await usuarioServices.cadastrarUsuarioComJornada(formData, jornadaData);
      console.log("Dados: ", formData)
      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: formData.usuario_nome,
          email: formData.usuarioEmail,
          password: formData.usuario_senha,
        }),
      });

      onSave(true);

      onClose(); // Fecha o modal após o envio
    } catch (error) {
      onSave(false)
    } finally {
      setIsSaving(false);
    }
  };

  const handleJornadaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setJornadaData({ ...jornadaData, [name]: value });
  };

  const handleDayClick = (index: number) => {
    const newDiasSemana = [...jornadaData.diasSemana];
    newDiasSemana[index] = !newDiasSemana[index]; // Alterna o estado do dia (marcado/desmarcado)
    setJornadaData({ ...jornadaData, diasSemana: newDiasSemana });
  };

  const handleHorarioFlexivelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setJornadaData({ ...jornadaData, horarioFlexivel: value === "true" });
  };

  return (
    <div>

      <form className="flex flex-col gap-4">
        {/* Horário Flexível */}
        <div className="flex items-center gap-8">
          <label htmlFor="horarioFlexivel" className="mr-2">Horário Flexível <span className="text-red-500">*</span></label>
          <div className="flex gap-8">
            <label className="flex items-center">
              <input
                type="radio"
                name="horarioFlexivel"
                value="true"
                checked={jornadaData.horarioFlexivel === true}
                onChange={handleHorarioFlexivelChange}
                className="w-5 h-5 mr-2"
              />
              Sim
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="horarioFlexivel"
                value="false"
                checked={jornadaData.horarioFlexivel === false}
                onChange={handleHorarioFlexivelChange}
                className="w-5 h-5 mr-2"
              />
              Não
            </label>
          </div>
          {formErrors.horarioFlexivel && <p className="text-red-500">{formErrors.horarioFlexivel._errors[0]}</p>}
        </div>

        {/* Mostrar campos somente se Horário Flexível for falso */}
        {!jornadaData.horarioFlexivel && (
          <>
            {/* Entrada e saída  */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="horarioEntrada">Entrada <span className="text-red-500">*</span></label>
                <input
                  id="horarioEntrada"
                  name="horarioEntrada"
                  type="time"
                  value={jornadaData.horarioEntrada}
                  onChange={handleJornadaChange}
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.horarioEntrada && <p className="text-red-500">{formErrors.horarioEntrada._errors[0]}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="horarioSaida">Saída <span className="text-red-500">*</span></label>
                <input
                  id="horarioSaida"
                  name="horarioSaida"
                  type="time"
                  value={jornadaData.horarioSaida}
                  onChange={handleJornadaChange}
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.horarioSaida && <p className="text-red-500">{formErrors.horarioSaida._errors[0]}</p>}
              </div>
            </div>

            {/* Carga Horária */}
            <div className="flex gap-4">
              <div className="flex-1">
                <label htmlFor="horarioAlmoco">Horário Almoço <span className="text-red-500">*</span></label>
                <input
                  id="horarioAlmoco"
                  name="horarioAlmoco"
                  type="time"
                  value={jornadaData.horarioAlmoco}
                  onChange={handleJornadaChange}
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.horarioAlmoco && <p className="text-red-500">{formErrors.horarioAlmoco._errors[0]}</p>}
              </div>
            </div>
          </>
        )}

        {/* Carga Horária Diária */}
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="usuario_cargaHoraria">Carga Horária Diária <span className="text-red-500">*</span></label>
            <input
              id="usuario_cargaHoraria"
              name="usuario_cargaHoraria"
              type="number"
              value={jornadaData.usuario_cargaHoraria}
              onChange={handleJornadaChange}
              className="border p-2 rounded-md w-full"
            />
            {formErrors.usuario_cargaHoraria && <p className="text-red-500">{formErrors.usuario_cargaHoraria._errors[0]}</p>}
          </div>
        </div>

        {/* Dias da Semana (Divs clicáveis com hover e click) */}
        <div>
          <label className="mb-2">Dias da Semana <span className="text-red-500">*</span></label>
          <div className="flex lg:gap-8 md:gap-[2rem] sm:gap-[3rem] gap-y-4 flex-wrap p-2 border rounded-lg w-full">
            {[ "Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((dia, index) => (
              <div
                key={index}
                className={`w-12 h-12 flex items-center justify-center cursor-pointer rounded-md transition-colors duration-200
                  ${jornadaData.diasSemana[index] ? "bg-[#FFCB50] text-white" : "text-black"}
                  hover:bg-gray-200`}
                onClick={() => handleDayClick(index)}
                style={{
                  backgroundColor: jornadaData.diasSemana[index] ? '#FFB503' : 'white', // Define a cor de fundo inline
                }}
              >
                {dia}
              </div>
            ))}
          </div>
          {formErrors.diasSemana && <p className="text-red-500">{formErrors.diasSemana._errors[0]}</p>}
        </div>

        {/* Botão de Salvar */}
        <button
          type="button"
          onClick={handleSave}
          className="bg-[#FFB503] hover:bg-[#FFCB50] text-white p-2 rounded-md"
          disabled={isSaving}
        >
          Salvar
        </button>
      </form>
    </div>
  );
}
