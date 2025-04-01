// src/components/CadastroForm.tsx
"use client";

import { useEffect, useState } from "react";
import { z } from "zod";
import CadastroJornada from "./CadastroJornada";
import Modal from "@/components/ui/modal";
import { setorSevices } from "@/services/setorService";
import { Setor } from "@/interfaces/usuarioInfo";
import { generatePassword } from "@/utils/emails/generatePassword";

const formSchema = z.object({
  usuario_nome: z.string()
  .min(1, "Campo obrigatório")
  .max(50, "O nome não pode ter mais de 50 caracteres.")
  .regex(/^[A-Za-zá-úÁ-Ú\s]+$/, "O nome não pode conter números ou caracteres especiais."),  // Validação para letras
  usuario_cpf: z.string().min(11, "Campo obrigatório").max(14, "O CPF deve ter 14 caracteres."),
  usuarioEmail: z.string().min(1, "Campo obrigatório").email("O email deve ser válido."),
  usuario_DataNascimento: z.string().min(1, "Campo obrigatório").regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento deve estar no formato YYYY-MM-DD."),
  usuario_nrRegistro: z.string().min(1, "Campo obrigatório").max(40, "O número de registro deve ser válido."),
  usuarioTipoContratacao: z.string().min(1, "Campo obrigatório").refine(val => ["CLT", "Estágio"].includes(val), {
    message: "Por favor, selecione um tipo de contrato válido."
  }),
  usuario_dataContratacao: z.string().min(1, "Campo obrigatório").regex(/^\d{4}-\d{2}-\d{2}$/, "A data do contrato deve estar no formato YYYY-MM-DD."),
  usuario_cargo: z.string()
  .min(1, "Campo obrigatório")
  .max(40, "O cargo não pode ter mais de 40 caracteres.")
  .regex(/^[A-Za-zá-úÁ-Ú\s]+$/, "O cargo não pode conter números ou caracteres especiais."),  // Validação para letras
  nivelAcesso_cod: z.string().min(1, "Campo obrigatório"),
  setorCod: z.string().min(1, "Campo obrigatório"),
});

type FormData = z.infer<typeof formSchema>;

export default function CadastroUsuario({ onClose, onSave }: { onClose: () => void;
  onSave: (sucess: boolean) => void }) {

  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  const generated_password = generatePassword(10);

  const [formData, setFormData] = useState({
    usuario_nome: "",
    usuario_cpf: "",
    usuario_nrRegistro: "",
    usuarioEmail: "",
    usuario_senha: generated_password,
    usuarioTipoContratacao: "",
    usuario_dataContratacao: "",
    usuario_DataNascimento: "",
    usuario_cargo: "",
    setorCod: "",
    empCod: 1,
    nivelAcesso_cod: ""
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const [setores, setSetores] = useState<Setor[]>([]);

  useEffect(() => { 
    fetchSetores();
  }, []);

  const fetchSetores = async () => {
    try {
      const data = await setorSevices.getAllSetores() as Setor[];
      setSetores(data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  };

  // Função para formatar o CPF
  const formatarCPF = (cpf: string) => {
    const apenasNumeros = cpf.replace(/\D/g, '');
  
    if (apenasNumeros.length <= 3) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 6) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3)}`;
    } else if (apenasNumeros.length <= 9) {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6)}`;
    } else {
      return `${apenasNumeros.slice(0, 3)}.${apenasNumeros.slice(3, 6)}.${apenasNumeros.slice(6, 9)}-${apenasNumeros.slice(9, 11)}`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Lógica comum para atualizar os dados do formulário
    let updatedValue: string | number = value;
  
    // Tratamento específico para campos que exigem formatação ou conversão
    switch (name) {
      case "usuario_nome":
        // Remover números e caracteres especiais
        updatedValue = value.replace(/[^A-Za-zá-úÁ-Ú\s]/g, '');
        break;
  
      case "usuario_cpf":
        // Formatar CPF
        updatedValue = formatarCPF(value);
        break;
  

      default:
        break;
    }
  
    // Atualizar o estado do formulário com o novo valor
    setFormData({ ...formData, [name]: updatedValue });
  };
  
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    // Validar o formulário com Zod
    const result = formSchema.safeParse(formData);

    // Se a validação falhar, atualize os erros
    if (!result.success) {
      const errors = result.error.format();
      setFormErrors(errors);
      return; // Não avançar para o próximo modal
    }

    setIsSecondModalOpen(true);
  };
  
  return (
    <div>
      {/* Primeiro Modal */}
      <Modal isOpen={!isSecondModalOpen} onClose={onClose} isSecondModal={false} title="Cadastrar Colaborador">
        <form onSubmit={handleNext} className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 max-h-[40rem] overflow-y-auto">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-40">
                <label htmlFor="usuario_nome" className="mb-2">Nome <span className="text-red-500">*</span></label>
                <input
                  id="usuario_nome"
                  type="text"
                  name="usuario_nome"
                  value={formData.usuario_nome}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_nome && <p className="text-red-500">{formErrors.usuario_nome._errors[0]}</p>}
              </div>
              <div className="flex-1 min-w-40">
                <label htmlFor="usuario_cpf" className="mb-2">CPF <span className="text-red-500">*</span></label>
                <input
                  id="usuario_cpf"
                  type="text"
                  name="usuario_cpf"
                  value={formData.usuario_cpf}
                  onChange={handleChange}
                  required
                  maxLength={14}
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_cpf && <p className="text-red-500">{formErrors.usuario_cpf._errors[0]}</p>}
              </div>
            </div>
            <div className="flex gap-4 flex-wrap"> {/* Usando flex para email e dataNasc na mesma linha */}
              <div className="flex-1 min-w-40">
                <label htmlFor="usuarioEmail" className="mb-2">Email <span className="text-red-500">*</span></label>
                <input
                  id="usuarioEmail"
                  type="email"
                  name="usuarioEmail"
                  value={formData.usuarioEmail}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuarioEmail && <p className="text-red-500">{formErrors.usuarioEmail._errors[0]}</p>}
              </div>

              <div className="flex-1  min-w-40">
                <label htmlFor="usuario_DataNascimento" className="mb-2">Data de Nascimento <span className="text-red-500">*</span></label>
                <input
                  id="usuario_DataNascimento"
                  type="date"
                  name="usuario_DataNascimento"
                  value={formData.usuario_DataNascimento}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_DataNascimento && <p className="text-red-500">{formErrors.usuario_DataNascimento._errors[0]}</p>}
              </div>
            </div>

            <div className="flex gap-4 flex-wrap"> {/* Usando flex para nrRegistro, tipoContrato e dataContrat na mesma linha */}
              <div className="flex-1 min-w-40">
                <label htmlFor="usuario_nrRegistro" className="mb-2">Número de Registro <span className="text-red-500">*</span></label>
                <input
                  id="usuario_nrRegistro"
                  type="text"
                  name="usuario_nrRegistro"
                  value={formData.usuario_nrRegistro}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_nrRegistro && <p className="text-red-500">{formErrors.usuario_nrRegistro._errors[0]}</p>}
              </div>

            
              <div className="flex-1 min-w-40">
                <label htmlFor="usuarioTipoContratacao" className="mb-2">Tipo de Contrato <span className="text-red-500">*</span></label>
                <select
                  id="usuarioTipoContratacao"
                  name="usuarioTipoContratacao"
                  value={formData.usuarioTipoContratacao}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Selecione o tipo de contrato</option>
                  <option value="CLT">CLT</option>
                  <option value="Estágio">Estágio</option>
                </select>
                {formErrors.usuariotipoContratacao && <p className="text-red-500">{formErrors.usuariotipoContratacao._errors[0]}</p>}
              </div>

              <div className="flex-1 min-w-40">
                <label htmlFor="usuario_dataContratacao" className="mb-2">Data de Contratação <span className="text-red-500">*</span></label>
                <input
                  id="usuario_dataContratacao"
                  type="date"
                  name="usuario_dataContratacao"
                  value={formData.usuario_dataContratacao}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_dataContratacao && formErrors.usuario_dataContratacao._errors && <p className="text-red-500">{formErrors.usuario_dataContratacao._errors[0]}</p>}
              </div>
            </div>


            {/* Campo de Cargo, Nível de Acesso e Setor na mesma linha */}
            <div className="flex gap-4 flex-wrap"> {/* Usando flex para cargo, nível de acesso e setor na mesma linha */}
            <div className="flex-1 min-w-40">
                <label htmlFor="usuario_cargo" className="mb-2">Cargo <span className="text-red-500">*</span></label>
                <input
                  id="usuario_cargo"
                  type="text"
                  name="usuario_cargo"
                  value={formData.usuario_cargo}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                />
                {formErrors.usuario_cargo && <p className="text-red-500">{formErrors.usuario_cargo._errors[0]}</p>}
              </div>

              <div className="flex-1 min-w-40">
                <label htmlFor="nivelAcesso_cod" className="mb-2">Nível de Acesso <span className="text-red-500">*</span></label>
                <select
                  id="nivelAcesso_cod"
                  name="nivelAcesso_cod"
                  value={formData.nivelAcesso_cod}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                >
                  <option value="">Selecione o tipo de acesso</option>
                  <option value={0}>Administrador</option>
                  <option value={1}>Gestor</option>
                  <option value={2}>Funcionário</option>
                </select>
                {formErrors.nivelAcesso_cod && <p className="text-red-500">{formErrors.nivelAcesso_cod._errors[0]}</p>}
              </div>

              <div className="flex-1 min-w-40">
                <label htmlFor="setorCod" className="mb-2">Setor <span className="text-red-500">*</span></label>
                <select
                  id="setorCod"
                  name="setorCod"
                  value={formData.setorCod}
                  onChange={handleChange}
                  required
                  className="border p-2 rounded-md w-full"
                  >
                    <option value="">Selecione um setor</option>
                    {setores.length > 0 ? (
                      setores.map((setor) => (
                        <option key={setor.setorCod} value={setor.setorCod}>
                        {setor.setorNome}
                        </option>
                      ))
                    ): (null)}
                    {/* Adicione mais opções conforme necessário */}
                  </select>
                {formErrors.setorCod && <p className="text-red-500">{formErrors.setorCod._errors[0]}</p>}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="bg-[#FFB503] hover:bg-[#FFCB50] text-white p-2 rounded-md"
          >
            Próximo
          </button>
        </form>
      </Modal>

     {/* Segundo Modal */}
     <Modal isOpen={isSecondModalOpen} onClose={onClose} isSecondModal={true} title="Cadastrar Colaborador">
        <CadastroJornada formData={formData} onClose={onClose} onSave={onSave}/>
      </Modal>
    </div>
  );
}
