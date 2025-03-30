"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { cadastrarEmpresa } from "@/src/services/empresaService";
import { cadastrarSetor } from "@/src/services/setorService";
import { cadastrarUsuarioComJornada } from "@/src/services/usuarioService";
import { z } from "zod";
import ModalEmpresa from "./ModalEmpresa";
import router from "next/router";
import { useToast } from "@/src/hooks/use-toast";
import { Toaster } from "@/src/components/ui/toaster";

// Interfaces e Schemas
interface EmpresaFormData {
  empNome: string;
  empRazaoSocial: string;
  empCnpj: string;
  empCep: string;
  empCidade: string;
  empEstado: string;
  empEndereco: string;
}

interface AdminFormData {
  admin_nome: string;
  admin_email: string;
  admin_setor: string;
  admin_tipoContrato: string;
  admin_cargo: string;
  admin_nvlAcesso: string;
}

const empresaSchema = z.object({
  empNome: z.string().min(1, "Nome é obrigatório"),
  empRazaoSocial: z.string().min(1, "Razão Social é obrigatória"),
  empCnpj: z.string().min(14, "CNPJ deve ser válido"),
  empCep: z.string().min(8, "CEP deve ser válido"),
  empCidade: z.string().min(1, "Cidade é obrigatória"),
  empEstado: z.string().min(1, "Estado é obrigatório"),
  empEndereco: z.string().min(1, "Endereço é obrigatório"),
});

const adminSchema = z.object({
  admin_nome: z.string().min(1, "Nome do administrador é obrigatório"),
  admin_email: z.string().email("Email inválido").min(1, "Email é obrigatório"),
  admin_setor: z.string().min(1, "Setor é obrigatório"),
  admin_tipoContrato: z.string().min(1, "Tipo de contrato é obrigatório"),
});

interface CadastroEmpresaFormProps {
  isMobile: boolean;
}

export default function CadastroEmpresaForm({ isMobile }: CadastroEmpresaFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [modalAtual, setModalAtual] = useState(1);
  const [empresaData, setEmpresaData] = useState<EmpresaFormData>({
    empNome: "",
    empRazaoSocial: "",
    empCnpj: "",
    empCep: "",
    empCidade: "",
    empEstado: "",
    empEndereco: "",
  });
  const [setores, setSetores] = useState<string[]>([]);
  const [adminData, setAdminData] = useState<AdminFormData>({
    admin_nome: "",
    admin_email: "",
    admin_setor: "",
    admin_tipoContrato: "CLT",
    admin_cargo: "",
    admin_nvlAcesso: "Administrador",
  });
  const [setorInput, setSetorInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { toast } = useToast();

  // Função para resetar todos os estados
  const resetForm = () => {
    setModalAtual(1);
    setEmpresaData({
      empNome: "",
      empRazaoSocial: "",
      empCnpj: "",
      empCep: "",
      empCidade: "",
      empEstado: "",
      empEndereco: "",
    });
    setSetores([]);
    setAdminData({
      admin_nome: "",
      admin_email: "",
      admin_setor: "",
      admin_tipoContrato: "CLT",
      admin_cargo: "",
      admin_nvlAcesso: "Administrador",
    });
    setSetorInput("");
    setErrors({});
  };

  // Efeitos
  useEffect(() => {
    if (!isOpen) resetForm();
  }, [isOpen]);

  useEffect(() => {
    const fetchAddress = async () => {
      const cepNumerico = empresaData.empCep.replace(/\D/g, "");
      if (cepNumerico.length !== 8) return;

      try {
        const response = await fetch(`https://viacep.com.br/ws/${cepNumerico}/json/`);
        const data = await response.json();
        if (data.erro) throw new Error("CEP não encontrado");

        setEmpresaData((prev) => ({
          ...prev,
          empCidade: data.localidade,
          empEstado: data.uf,
          empEndereco: `${data.logradouro}, ${data.bairro}`,
        }));
        setErrors((prev) => ({ ...prev, empCep: "" }));
      } catch (error) {
        setEmpresaData((prev) => ({ ...prev, empCidade: "", empEstado: "", empEndereco: "" }));
        setErrors((prev) => ({ ...prev, empCep: "CEP inválido ou não encontrado" }));
      }
    };
    fetchAddress();
  }, [empresaData.empCep]);

  // Handlers
  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const formatters: Record<string, (v: string) => string> = {
      empCnpj: formatCNPJ,
      empCep: formatCEP,
    };
    const formattedValue = formatters[name] ? formatters[name](value) : value;
    setEmpresaData((prev) => ({ ...prev, [name]: formattedValue }));
  };

  const handleAdminChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSetorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSetorInput(e.target.value);
  };

  const handleAddSetor = () => {
    const trimmedInput = setorInput.trim();
    if (!trimmedInput) return;

    if (setores.some((setor) => setor.toLowerCase() === trimmedInput.toLowerCase())) {
      setErrors((prev) => ({ ...prev, setorInput: "Este setor já foi cadastrado" }));
      return;
    }

    setSetores((prev) => [...prev, trimmedInput]);
    setSetorInput("");
    setErrors((prev) => ({ ...prev, setorInput: "" }));
  };

  const handleRemoveSetor = (index: number) => {
    setSetores((prev) => prev.filter((_, i) => i !== index));
  };

  // Formatters
  const formatCNPJ = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");

  const formatCEP = (value: string) =>
    value
      .replace(/\D/g, "")
      .slice(0, 8)
      .replace(/(\d{5})(\d)/, "$1-$2");

  // Validações
  const validateStep = (step: number) => {
    if (step === 1) {
      const result = empresaSchema.safeParse({
        ...empresaData,
        empCnpj: empresaData.empCnpj.replace(/\D/g, ""),
        empCep: empresaData.empCep.replace(/\D/g, ""),
      });
      if (!result.success) {
        setErrors(result.error.errors.reduce((acc, err) => ({ ...acc, [err.path[0]]: err.message }), {}));
        return false;
      }
    } else if (step === 3) {
      const result = adminSchema.safeParse(adminData);
      if (!result.success) {
        setErrors(result.error.errors.reduce((acc, err) => ({ ...acc, [err.path[0]]: err.message }), {}));
        return false;
      }
    }
    setErrors({});
    return true;
  };

  const handleNextStep = (nextStep: number) => {
    if ((modalAtual === 1 || modalAtual === 3) && !validateStep(modalAtual)) return;
    if (modalAtual === 2 && setores.length === 0) {
      setErrors((prev) => ({ ...prev, setores: "É necessário cadastrar pelo menos um setor" }));
      return;
    }
    setErrors({});
    setModalAtual(nextStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(3)) return;

    try {
      // Cadastra a empresa e obtém o empCod
      const empCod = await cadastrarEmpresa(empresaData);

      // Cadastra os setores e obtém o mapeamento de setorNome para setorCod
      const setoresCriados = await cadastrarSetor(setores);
      const setorCodMap = setoresCriados.reduce((acc: Record<string, number>, setor: any) => {
        acc[setor.setorNome] = setor.setorCod;
        return acc;
      }, {});

      // Obtém o setorCod do setor selecionado pelo admin
      const setorCod = setorCodMap[adminData.admin_setor];

      // Monta os dados do usuário com os códigos reais
      const usuarioData = {
        usuario_nome: adminData.admin_nome,
        usuarioEmail: adminData.admin_email,
        usuario_cargo: adminData.admin_cargo,
        usuarioTipoContratacao: adminData.admin_tipoContrato,
        usuario_senha: "123456",
        empCod: empCod,
        setorCod: setorCod,
        nivelAcesso_cod: 0,
        usuario_cpf: null,
        usuario_nrRegistro: null,
        usuario_cargaHoraria: null,
        usuario_dataContratacao: null,
        usuario_DataNascimento: null,
      };

      await cadastrarUsuarioComJornada(usuarioData, {});

      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Realize login usando as credenciais enviadas para seu e-mail.",
        variant: "default",
      });

      console.log("Dados enviados:", { empresaData, setores, usuarioData });
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao finalizar cadastro" }));
    }
  };

  // Render
  return (
    <div>
      <Toaster />
      {modalAtual === 1 && (
        <ModalEmpresa isOpen={isOpen} onClose={() => setIsOpen(false)} title="Seja Bem Vindo!" etapaAtual={1}>
          <div className="w-[85%] mx-auto">
            <form className="flex flex-col gap-4">
              <div className="flex-1 mt-3">
                <label htmlFor="empNome" className="mb-2">Nome</label>
                <input id="empNome" name="empNome" value={empresaData.empNome} onChange={handleInputChange} className="border p-2 rounded-md w-full" />
                {errors.empNome && <p className="text-red-500">{errors.empNome}</p>}
              </div>
              <div className="flex-1 mt-3">
                <label htmlFor="empRazaoSocial" className="mb-2">Razão Social</label>
                <input id="empRazaoSocial" name="empRazaoSocial" value={empresaData.empRazaoSocial} onChange={handleInputChange} className="border p-2 rounded-md w-full" />
                {errors.empRazaoSocial && <p className="text-red-500">{errors.empRazaoSocial}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="empCnpj" className="mb-2">CNPJ</label>
                <input id="empCnpj" name="empCnpj" value={empresaData.empCnpj} onChange={handleInputChange} maxLength={18} className="border p-2 rounded-md w-full" />
                {errors.empCnpj && <p className="text-red-500">{errors.empCnpj}</p>}
              </div>
              <div className="flex-1 mt-3">
                <label htmlFor="empCep" className="mb-2">CEP do Endereço</label>
                <input id="empCep" name="empCep" value={empresaData.empCep} onChange={handleInputChange} className="border p-2 rounded-md w-full" />
                {errors.empCep && <p className="text-red-500">{errors.empCep}</p>}
              </div>
              {empresaData.empCidade && <p className="endereco-label">{`${empresaData.empEndereco}, ${empresaData.empCidade} - ${empresaData.empEstado}`}</p>}
              <button type="button" onClick={() => handleNextStep(2)} className="text-black p-2 rounded-md bg-[#FFB503]">Prosseguir</button>
            </form>
            {isMobile && (
              <span
                style={{ display: "block", textAlign: "center", marginTop: "2%" }}
                onClick={() => router.push("/")}
              >
                Já tem uma conta? Faça Login!
              </span>
            )}
          </div>
        </ModalEmpresa>
      )}

      {modalAtual === 2 && (
        <ModalEmpresa isOpen={isOpen} onClose={() => setIsOpen(false)} title="Seja Bem Vindo!" etapaAtual={2}>
          <div className="grid grid-rows-[1fr_auto] min-h-[40vh] gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label htmlFor="setorInput" className="mb-2">Nome do Setor:</label>
                  <input
                    id="setorInput"
                    value={setorInput}
                    onChange={handleSetorChange}
                    placeholder="Digite o nome do setor"
                    className="border p-2 rounded-md w-full"
                  />
                  {errors.setorInput && <p className="text-red-500 mt-1">{errors.setorInput}</p>}
                </div>
                <button
                  onClick={handleAddSetor}
                  className="bg-[#FFB503] text-black w-10 h-10 rounded-full flex items-center justify-center mt-6 border-none cursor-pointer text-lg"
                >
                  +
                </button>
              </div>
              {setores.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {setores.map((setor, index) => (
                    <div key={index} className="relative inline-block">
                      <span className="border border-[#bbbbbb] rounded-md p-2">{setor}</span>
                      <button
                        onClick={() => handleRemoveSetor(index)}
                        className="absolute -top-2 -right-2 bg-[#D61818] text-white w-5 h-5 rounded-full flex items-center justify-center border-none cursor-pointer text-xs"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {errors.setores && <p className="text-red-500 mt-2">{errors.setores}</p>}
            </div>
            <button
              type="button"
              onClick={() => handleNextStep(3)}
              className="text-black p-2 rounded-md bg-[#FFB503] w-full"
            >
              Prosseguir
            </button>
          </div>
        </ModalEmpresa>
      )}

      {modalAtual === 3 && (
        <ModalEmpresa isOpen={isOpen} onClose={() => setIsOpen(false)} title="Seja Bem Vindo!" etapaAtual={3}>
          <div className="w-[85%] mx-auto">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex-1">
                <label htmlFor="admin_nome" className="mb-2">Nome do Administrador</label>
                <input id="admin_nome" name="admin_nome" value={adminData.admin_nome} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_nome && <p className="text-red-500">{errors.admin_nome}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="admin_email" className="mb-2">Email</label>
                <input id="admin_email" name="admin_email" type="email" value={adminData.admin_email} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_email && <p className="text-red-500">{errors.admin_email}</p>}
              </div>
              <div className ="flex-1">
                <label htmlFor="admin_cargo" className="mb-2">Cargo</label>
                <input id="admin_cargo" name="admin_cargo" value={adminData.admin_cargo} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_cargo && <p className="text-red-500">{errors.admin_cargo}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="admin_setor" className="mb-2">Setor</label>
                <select id="admin_setor" name="admin_setor" value={adminData.admin_setor} onChange={handleAdminChange} className="border p-2 rounded-md w-full">
                  <option value="" disabled>Selecione um setor</option>
                  {setores.map((setor, index) => <option key={index} value={setor}>{setor}</option>)}
                </select>
                {errors.admin_setor && <p className="text-red-500">{errors.admin_setor}</p>}
              </div>
              <div className="flex gap-5">
                <div className="flex-1">
                  <label htmlFor="admin_tipoContrato" className="mb-2">Tipo de Contrato</label>
                  <select
                    id="admin_tipoContrato"
                    name="admin_tipoContrato"
                    value={adminData.admin_tipoContrato}
                    onChange={handleAdminChange}
                    className="border p-2 rounded-md w-full"
                    disabled
                  >
                    <option value="CLT">CLT</option>
                  </select>
                  {errors.admin_tipoContrato && <p className="text-red-500">{errors.admin_tipoContrato}</p>}
                </div>
                <div className="flex-1">
                  <label htmlFor="admin_nvlAcesso" className="mb-2">Nível de Acesso</label>
                  <input id="admin_nvlAcesso" name="admin_nvlAcesso" value="Administrador" readOnly className="border p-2 rounded-md w-full" />
                </div>
              </div>
              <button type="submit" className="text-black p-2 rounded-md bg-[#FFB503]">Finalizar</button>
            </form>
            {errors.submit && <p className="text-red-500 mt-2">{errors.submit}</p>}
          </div>
        </ModalEmpresa>
      )}
    </div>
  );
}