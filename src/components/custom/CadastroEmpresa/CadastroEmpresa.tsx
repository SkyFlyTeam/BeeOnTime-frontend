"use client";
// General
import { ApiException } from "@/config/apiExceptions";
import { ChangeEvent, useEffect, useState } from "react";

import router from "next/router";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

// Services
import { empresaServices } from "@/services/empresaService";
import { setorServices } from "@/services/setorService";
import { usuarioServices } from "@/services/usuarioServices";
import { Setor } from "@/interfaces/setor";

// Components
import ModalEmpresa from "./ModalEmpresa";
import { Toaster } from "@/components/ui/toaster";

// Utils
import { generatePassword } from "@/utils/emails/generatePassword";
import { EmpresaAPI } from "@/interfaces/empresa";

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
  admin_cargo: z.string().min(1, "Cargo é obrigatório"),
  admin_tipoContrato: z.string().min(1, "Tipo de contrato é obrigatório"),
});

interface CadastroEmpresaFormProps {
  isMobile: boolean;
}

export default function CadastroEmpresaForm({ isMobile }: CadastroEmpresaFormProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

    if (Object.keys(errors).length == 0)
      return;

    const result = empresaSchema.partial().safeParse({ [name]: (name == "empCnpj" || name == "empCep" ? formattedValue.replace(/\D/g, "") : formattedValue) })
    if (result.success)
      delete errors[name];
  };

  const handleAdminChange = async (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAdminData((prev) => ({ ...prev, [name]: value }));

    if (Object.keys(errors).length == 0)
      return;

    const result = empresaSchema.partial().safeParse({ [name]: value })
    if (result.success)
      delete errors[name];

  };

  const handleSetorChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSetorInput(e.target.value);
    delete errors["setorInput"];
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
    //setErrors((prev) => ({ ...prev, setorInput: "" }));
    delete errors["setores"];
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

  const handleNextStep = async (nextStep: number) => {
    if ((modalAtual === 1 || modalAtual === 3) && !validateStep(modalAtual))
      return;
    if (modalAtual === 2 && setores.length === 0) {
      setErrors((prev) => ({ ...prev, setores: "É necessário cadastrar pelo menos um setor" }));
      return;
    }
    // Terminado filtro de entradas, verificar email e cnpj
    //
    // ISTO DEVERIA SER VERIFICADO NO BACKEND, NÃO NO CLIENTE!
    if (modalAtual === 1) {
      const empresasData = await empresaServices.verificarEmpresa();
      const empresas = empresasData as EmpresaAPI[]
      if (empresas.some(emp => emp.empCnpj == empresaData.empCnpj)) {
        setErrors((prev) => ({ ...prev, empCnpj: "CNPJ já cadastrado" }));
        return;
      }
    }
    // Tudo ok
    setErrors({});
    setModalAtual(nextStep);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!validateStep(3)) {
      setIsSubmitting(false);
      return;
    }
    const empresasData = await empresaServices.verificarEmpresa();
    const empresas = empresasData as EmpresaAPI[]
    if(empresas.some(emp => emp.usuarios.some((us: {usuarioEmail: string})=> adminData.admin_email == us.usuarioEmail))){
      setErrors((prev) => ({ ...prev, admin_email: "Email já cadastrado" }));
      setIsSubmitting(false);
      return;
    }

    try {
      const empCod = await empresaServices.cadastrarEmpresa(empresaData);
      if (empCod instanceof ApiException) {
        throw new Error(empCod.message);
      }
      
      const setoresCriados = await setorServices.cadastrarSetor(setores, empCod);
      if (setoresCriados instanceof ApiException) {
        throw new Error(setoresCriados.message);
      }
      const setorCodMap = setoresCriados.reduce((acc: Record<string, number>, setor: Setor) => {
        acc[setor.setorNome] = setor.setorCod;
        return acc;
      }, {});

      const setorCod = setorCodMap[adminData.admin_setor];
      const generated_password = generatePassword(10);

      const usuarioData = {
        usuario_nome: adminData.admin_nome,
        usuarioEmail: adminData.admin_email,
        usuario_cargo: adminData.admin_cargo,
        usuarioTipoContratacao: adminData.admin_tipoContrato,
        usuario_senha: generated_password,
        empCod: empCod,
        setorCod: setorCod,
        nivelAcesso_cod: 0,
        usuario_cpf: null,
        usuario_nrRegistro: null,
        usuario_cargaHoraria: null,
        usuario_dataContratacao: null,
        usuario_DataNascimento: null,
      };

      const usuarioResult = await usuarioServices.cadastrarUsuarioComJornada(usuarioData, {});
      if (usuarioResult instanceof ApiException) {
        throw new Error(usuarioResult.message);
      }

      const res = await fetch('/api/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: adminData.admin_nome,
          email: adminData.admin_email,
          password: generated_password,
        }),
      });

      toast({
        title: "Cadastro concluído com sucesso!",
        description: "Realize login usando as credenciais enviadas para seu e-mail.",
        variant: "default",
      });

      console.log("Dados enviados:", { empresaData, setores, usuarioData });
      await router.push("/");
      resetForm();
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      setErrors((prev) => ({ ...prev, submit: "Erro ao finalizar cadastro" }));
    }
    setIsSubmitting(false);
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
                <label htmlFor="empNome" className="mb-2">Nome <span className="text-red-500">*</span></label>
                <input id="empNome" name="empNome" value={empresaData.empNome} onChange={handleInputChange} className="border p-2 rounded-md w-full" />
                {errors.empNome && <p className="text-red-500">{errors.empNome}</p>}
              </div>
              <div className="flex-1 mt-3">
                <label htmlFor="empRazaoSocial" className="mb-2">Razão Social <span className="text-red-500">*</span></label>
                <input id="empRazaoSocial" name="empRazaoSocial" value={empresaData.empRazaoSocial} onChange={handleInputChange} className="border p-2 rounded-md w-full" />
                {errors.empRazaoSocial && <p className="text-red-500">{errors.empRazaoSocial}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="empCnpj" className="mb-2">CNPJ <span className="text-red-500">*</span></label>
                <input id="empCnpj" name="empCnpj" value={empresaData.empCnpj} onChange={handleInputChange} maxLength={18} className="border p-2 rounded-md w-full" />
                {errors.empCnpj && <p className="text-red-500">{errors.empCnpj}</p>}
              </div>
              <div className="flex-1 mt-3">
                <label htmlFor="empCep" className="mb-2">CEP do Endereço <span className="text-red-500">*</span></label>
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
                  <label htmlFor="setorInput" className="mb-2">Nome do Setor: <span className="text-red-500">*</span></label>
                  <input
                    id="setorInput"
                    value={setorInput}
                    onChange={handleSetorChange}
                    placeholder="Digite o nome do setor"
                    className="border p-2 rounded-md w-full"
                    style={{marginBottom: "1vh"}}
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
                    <div key={index} className="relative inline-block" style={{marginBottom: "1rem"}}>
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
                <label htmlFor="admin_nome" className="mb-2">Nome do Administrador <span className="text-red-500">*</span></label>
                <input id="admin_nome" name="admin_nome" value={adminData.admin_nome} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_nome && <p className="text-red-500">{errors.admin_nome}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="admin_email" className="mb-2">Email <span className="text-red-500">*</span></label>
                <input id="admin_email" name="admin_email" type="email" value={adminData.admin_email} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_email && <p className="text-red-500">{errors.admin_email}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="admin_cargo" className="mb-2">Cargo <span className="text-red-500">*</span></label>
                <input id="admin_cargo" name="admin_cargo" value={adminData.admin_cargo} onChange={handleAdminChange} className="border p-2 rounded-md w-full" />
                {errors.admin_cargo && <p className="text-red-500">{errors.admin_cargo}</p>}
              </div>
              <div className="flex-1">
                <label htmlFor="admin_setor" className="mb-2">Setor <span className="text-red-500">*</span></label>
                <select id="admin_setor" name="admin_setor" value={adminData.admin_setor} onChange={handleAdminChange} className="border p-2 rounded-md w-full">
                  <option value="" disabled>Selecione um setor</option>
                  {setores.map((setor, index) => <option key={index} value={setor}>{setor}</option>)}
                </select>
                {errors.admin_setor && <p className="text-red-500">{errors.admin_setor}</p>}
              </div>
              <div className="flex gap-5">
                <div className="flex-1">
                  <label htmlFor="admin_tipoContrato" className="mb-2">Tipo de Contrato <span className="text-red-500">*</span></label>
                  <select
                    id="admin_tipoContrato"
                    name="admin_tipoContrato"
                    value={adminData.admin_tipoContrato}
                    onChange={handleAdminChange}
                    className="border p-2 rounded-md w-full"
                    style={{backgroundColor:"#CBD5E1"}}
                    disabled
                  >
                    <option value="CLT">CLT <span className="text-red-500">*</span></option>
                  </select>
                  {errors.admin_tipoContrato && <p className="text-red-500">{errors.admin_tipoContrato}</p>}
                </div>
                <div className="flex-1">
                  <label htmlFor="admin_nvlAcesso" className="mb-2">Nível de Acesso <span className="text-red-500">*</span></label>
                  <input id="admin_nvlAcesso" name="admin_nvlAcesso" value="Administrador" readOnly style={{ color: "rgba(0, 0, 0, 0.65)" }} className="border p-2 rounded-md w-full" />
                </div>
              </div>
              <button type="submit" className="text-black p-2 rounded-md bg-[#FFB503]" disabled={isSubmitting}>{isSubmitting == false ? "Finalizar" : "Cadastrando..."}</button>
            </form>
            {errors.submit && <p className="text-red-500 mt-2">{errors.submit}</p>}
          </div>
        </ModalEmpresa>
      )}
    </div>
  );
}