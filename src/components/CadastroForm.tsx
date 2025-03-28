// src/components/CadastroForm.tsx
"use client";

import { useState } from "react";
import { z } from "zod";
import CadastroFormJornada from "./CadastroFormJornada";
import Modal from "@/components/ui/modal";

const formSchema = z.object({
  nome: z.string().min(2, "O nome deve ter pelo menos 2 caracteres.").max(50, "O nome não pode ter mais de 50 caracteres."),
  cpf: z.string().min(11, "O CPF deve ter 11 caracteres").max(14, "O CPF deve ter 14 caracteres."),
  email: z.string().email("O email deve ser válido."),
  dataNasc: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data de nascimento deve estar no formato YYYY-MM-DD."),
  nrRegistro: z.string().max(40, "O número de registro deve ser válido."),
  tipoContrato: z.string().refine(val => ["CLT", "PJ", "Estágio"].includes(val), {
    message: "Por favor, selecione um tipo de contrato válido."
  }),
  dataContrat: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "A data do contrato deve estar no formato YYYY-MM-DD."),
  cargo: z.string().min(2, "O cargo deve ter pelo menos 2 caracteres.").max(40, "O cargo não pode ter mais de 40 caracteres."),
  nivelAcesso: z.string().min(2, "O nível de acesso deve ter pelo menos 2 caracteres.").max(40, "O nível de acesso não pode ter mais de 40 caracteres."),
  setor: z.string().max(40, "O setor deve ser válido."),
});

type FormData = z.infer<typeof formSchema>;

export default function CadastroForm({ onClose }: { onClose: () => void }) {
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    usuario_nome: "",
    usuario_cpf: "",
    usuario_nrRegistro: "",
    usuario_email: "",
    usuarioTipoContratacao: "",
    usuario_dataContratacao: "",
    usuario_DataNascimento: "",
    usuario_cargo: "",
    setor: "",
  });
  const [formErrors, setFormErrors] = useState<any>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    const novoValor = name === "usuario_cpf"
      ? formatarCPF(value)
      : value;
  
    setFormData({ ...formData, [name]: novoValor });
  };
  

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSecondModalOpen(true);
  };

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
  

  return (
    <div>
      {/* Primeiro Modal */}
      <Modal isOpen={!isSecondModalOpen} onClose={onClose} isSecondModal={false} title="Cadastrar Colaborador">
        <form onSubmit={handleNext} className="flex flex-col gap-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="usuario_nome" className="mb-2">Nome</label>
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
            <div className="flex-1">
              <label htmlFor="usuario_cpf" className="mb-2">CPF</label>
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
          <div className="flex gap-4"> {/* Usando flex para email e dataNasc na mesma linha */}
            <div className="flex-1">
              <label htmlFor="usuario_email" className="mb-2">Email</label>
              <input
                id="usuario_email"
                type="email"
                name="usuario_email"
                value={formData.usuario_email}
                onChange={handleChange}
                required
                className="border p-2 rounded-md w-full"
              />
              {formErrors.usuario_email && <p className="text-red-500">{formErrors.usuario_email._errors[0]}</p>}
            </div>

            <div className="flex-1">
              <label htmlFor="usuario_DataNascimento" className="mb-2">Data de Nascimento</label>
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

          <div className="flex gap-4"> {/* Usando flex para nrRegistro, tipoContrato e dataContrat na mesma linha */}
            <div className="flex-1">
              <label htmlFor="usuario_nrRegistro" className="mb-2">Número de Registro</label>
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

          
            <div className="flex-1">
              <label htmlFor="usuarioTipoContratacao" className="mb-2">Tipo de Contrato</label>
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
                <option value="PJ">PJ</option>
                <option value="Estágio">Estágio</option>
              </select>
              {formErrors.usuariotipoContratacao && <p className="text-red-500">{formErrors.usuariotipoContratacao._errors[0]}</p>}
            </div>

            <div className="flex-1">
              <label htmlFor="usuario_dataContratacao" className="mb-2">Data do Contrato</label>
              <input
                id="usuario_dataContratacao"
                type="date"
                name="usuario_dataContratacao"
                value={formData.usuario_dataContratacao}
                onChange={handleChange}
                required
                className="border p-2 rounded-md w-full"
              />
              {formErrors.usuario_dataContratacao && <p className="text-red-500">{formErrors.usuario_dataContratacao_errors[0]}</p>}
            </div>
          </div>

          


          {/* Campo de Cargo, Nível de Acesso e Setor na mesma linha */}
          <div className="flex gap-4"> {/* Usando flex para cargo, nível de acesso e setor na mesma linha */}
            <div className="flex-1">
              <label htmlFor="usuario_cargo" className="mb-2">Cargo</label>
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

            <div className="flex-1">
              <label htmlFor="nivelAcesso" className="mb-2">Nível de Acesso</label>
              <input
                id="nivelAcesso"
                type="text"
                name="nivelAcesso"
                // value={formData.nivelAcesso}
                // onChange={handleChange}
                required
                className="border p-2 rounded-md w-full"
              />
              {formErrors.nivelAcesso && <p className="text-red-500">{formErrors.nivelAcesso._errors[0]}</p>}
            </div>

            <div className="flex-1">
              <label htmlFor="setor" className="mb-2">Setor</label>
              <select
                id="setor"
                name="setor"
                value={formData.setor}
                onChange={handleChange}
                required
                className="border p-2 rounded-md w-full"
                >
                  <option value="">Selecione um setor</option>
                  <option value="setor1">Setor 1</option>
                  <option value="setor2">Setor 2</option>
                  <option value="setor3">Setor 3</option>
                  {/* Adicione mais opções conforme necessário */}
                </select>
              {formErrors.setor && <p className="text-red-500">{formErrors.setor._errors[0]}</p>}
            </div>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="bg-[#FFB503] text-white p-2 rounded-md"
          >
            Próximo
          </button>
        </form>
      </Modal>

     {/* Segundo Modal */}
     <Modal isOpen={isSecondModalOpen} onClose={onClose} isSecondModal={true} title="Cadastrar Colaborador">
        <CadastroFormJornada formData={formData} onClose={onClose} />
      </Modal>
    </div>
  );
}
