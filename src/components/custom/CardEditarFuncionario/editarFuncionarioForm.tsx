"use client";
// General
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { object, z } from "zod";

// Services
import { usuarioServices } from "@/services/usuarioServices";
import { setorServices } from "@/services/setorService";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch"
import { useEffect, useState } from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Setor } from "@/interfaces/setor";
import { ApiException } from "@/config/apiExceptions";
import { set } from "date-fns";
import { NivelAcesso } from "@/interfaces/nivelAcesso";
import { SSG_GET_INITIAL_PROPS_CONFLICT } from "next/dist/lib/constants";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { noop } from "@tanstack/react-table";
import { toast, ToastContainer } from "react-toastify";


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
  usuario_status: z.boolean(),
});

interface EditarFuncionarioFormProps {
  usuarioInfo: Usuario;
}

export default function EditarFuncionarioForm({ usuarioInfo }: EditarFuncionarioFormProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [onlyCLT, setOnlyCLT] = useState(false);
  const [setores, setSetores] = useState<Setor[]>([]);

  function isSaveDisabled() {
    return Object.keys(forms.formState.errors).length > 0;
  }

  function isFormsUsuarioDefault() {
    return !Object.keys(forms.control._defaultValues).some((field) =>
      forms.control._defaultValues[field] !== forms.control._formValues[field]
    );
  }

  const showSucessToast = () => {
    toast.success("Colaborador atualizado com sucesso!", {
      position: "top-center",
    });
  };

  function checkOnlyCLT(nivelAcesso_cod: number) {
    const check = nivelAcesso_cod != 2
    setOnlyCLT(check);
    return check;
  }
  async function fetchSetores() {
    try {
      const data = await setorServices.getAllSetores() as Setor[];
      setSetores(data);
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  }

  function checkCPF(tupla: any, cpf: String): Boolean {
    return Object.keys(tupla).some((user) =>
      tupla[user].usuario_cpf === cpf
    );
  }
  function checkEmail(tupla: any, email: String): Boolean {
    return Object.keys(tupla).some((user) =>
      tupla[user].usuarioEmail === email
    );
  }
  async function retrieveUsuarios() {
    try {
      const tupla = ["usuarioEmail", "usuario_cpf"]
      const data = await usuarioServices.getAllUsuarios() as Usuario[];
      Object.keys(data).forEach((user) =>
        Object.keys(data[user]).forEach((prop) =>
          tupla.includes(prop) || delete data[user][prop]));
      return data;
    } catch (error) {
      console.error("Erro ao carregar setores:", error);
    }
  }

  const forms = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      usuario_nome: usuarioInfo.usuario_nome,
      usuario_cpf: usuarioInfo.usuario_cpf,
      usuarioEmail: usuarioInfo.usuarioEmail as string,
      usuario_DataNascimento: usuarioInfo.usuario_DataNascimento instanceof Date ? usuarioInfo.usuario_DataNascimento.toISOString().split('T')[0] : usuarioInfo.usuario_DataNascimento,
      usuario_nrRegistro: usuarioInfo.usuario_nrRegistro?.toString(),
      usuario_dataContratacao: usuarioInfo.usuario_dataContratacao instanceof Date ? usuarioInfo.usuario_dataContratacao.toISOString().split('T')[0] : usuarioInfo.usuario_dataContratacao,
      usuarioTipoContratacao: usuarioInfo.usuarioTipoContratacao,
      usuario_cargo: usuarioInfo.usuario_cargo,
      nivelAcesso_cod: usuarioInfo.nivelAcesso.nivelAcesso_cod.toString(),
      setorCod: usuarioInfo.setor.setorCod.toString(),
      usuario_status: usuarioInfo.usuario_status == null ? true : usuarioInfo.usuario_status,
    },
  });
  //alert(JSON.stringify(forms.formState.errors))
  useEffect(() => {
    fetchSetores();
  }, []);
  useEffect(() => {
    checkOnlyCLT(usuarioInfo.nivelAcesso.nivelAcesso_cod);
  }, []);

  function onChangeAccess(fieldOnChange: any, fieldValue: string) {
    if (checkOnlyCLT(parseInt(fieldValue)))
      forms.setValue("usuarioTipoContratacao", "CLT")
    return fieldOnChange;
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isSaving)
      return;

    if (
      values.usuarioEmail != usuarioInfo.usuarioEmail ||
      values.usuario_cpf != usuarioInfo.usuario_cpf
    ) {
      const usuarios = await retrieveUsuarios()

      if (values.usuarioEmail != usuarioInfo.usuarioEmail)
        if (checkEmail(usuarios, values.usuarioEmail))
          forms.setError("usuarioEmail", { type: "409", message: "Email já cadastrado" });

      if (values.usuario_cpf != usuarioInfo.usuario_cpf)
        if (checkCPF(usuarios, values.usuario_cpf))
          forms.setError("usuario_cpf", { type: "409", message: "CPF já cadastrado" });
    }
    if (Object.keys(forms.formState.errors).length > 0) {
      setIsSaving(false);
      return;
    }
    const newData = {
      usuario_cod: usuarioInfo.usuario_cod,
      usuario_cargaHoraria: usuarioInfo.usuario_cargaHoraria,
      usuario_senha: "",
      empCod: usuarioInfo.empCod,
      jornadas: usuarioInfo.jornadas,
      //
      usuarioNRegistro: values.usuario_nrRegistro,
      usuario_dataContratacao: values.usuario_dataContratacao,
      usuario_DataNascimento: values.usuario_DataNascimento,
      usuarioTipoContratacao: onlyCLT ? "CLT" : values.usuarioTipoContratacao,
      usuario_nrRegistro: values.usuario_nrRegistro,
      usuario_nome: values.usuario_nome,
      usuarioEmail: values.usuarioEmail,
      usuario_cpf: values.usuario_cpf,
      usuario_cargo: values.usuario_cargo,
      usuario_status: values.usuario_status,
      setorCod: values.setorCod,
      nivelAcesso_cod: values.nivelAcesso_cod,
    }

    const test = usuarioServices.atualizarUsuario(newData);
    showSucessToast();
    //const newUserData = await fetchUsuario(usuarioInfo.usuario_cod)
    // Temporary until a better solution is implemented
    window.location.reload();
    //
    setIsSaving(false);
  }
  return (
    <Form {...forms}>
      <form onSubmit={forms.handleSubmit(onSubmit)}>
        <div className="flex flex-row flex-wrap gap-6">
          {/* Status Toggle */}
          <FormField
            control={forms.control}
            name="usuario_status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center">
                        <Switch
                          checked={field.value}
                          // onCheckedChange={field.onChange}
                          onCheckedChange={field.onChange}
                        />
                      </TooltipTrigger>
                      <TooltipContent side="bottom"
                        className={" " +
                          (field.value ? "text-white bg-[#FFB503]" : "bg-[#CBD5E1]")}>
                        <span className="">{field.value ? "Usuário ativo" : "Usuário inativo"}</span>
                        <TooltipArrow className={field.value ? "fill-[#FFB503]" : "fill-[#CBD5E1]"} />
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Name */}
          <FormField
            control={forms.control}
            name="usuario_nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input placeholder="" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* CPF */}
          <FormField
            control={forms.control}
            name="usuario_cpf"
            render={({ field }) => (
              <FormItem>
                <FormLabel>CPF</FormLabel>
                <FormControl>
                  <Input placeholder="" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={forms.control}
            name="usuarioEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Nascimento */}
          <FormField
            control={forms.control}
            name="usuario_DataNascimento"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Nascimento</FormLabel>
                <FormControl>
                  <Input type="date" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Numero Registro */}
          <FormField
            control={forms.control}
            name="usuario_nrRegistro"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Registro</FormLabel>
                <FormControl>
                  <Input type="text" placeholder="" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nível de Acesso */}
          <FormField
            control={forms.control}
            name="nivelAcesso_cod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível de Acesso</FormLabel>
                <Select onValueChange={onChangeAccess(field.onChange, field.value)} defaultValue={field.value}>
                  <SelectTrigger className="border p-2 rounded-md bg-white" >
                    <SelectValue placeholder={field.value} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="0">Administrador</SelectItem>
                      <SelectItem value="1">Gestor</SelectItem>
                      <SelectItem value="2">Funcionário</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Data de Contratação */}
          <FormField
            control={forms.control}
            name="usuario_dataContratacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Contratação</FormLabel>
                <FormControl>
                  <Input type="date" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Cargo */}
          <FormField
            control={forms.control}
            name="usuario_cargo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cargo</FormLabel>
                <FormControl>
                  <Input placeholder="" className="border p-2 rounded-md bg-white"  {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo de Contrato */}
          <FormField
            control={forms.control}
            name="usuarioTipoContratacao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Contrato</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                  <SelectTrigger className="border p-2 rounded-md bg-white" >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="CLT">CLT</SelectItem>
                      <SelectItem value="Estágio" disabled={onlyCLT}>Estágio</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />


          {/* Setor */}
          <FormField
            control={forms.control}
            name="setorCod"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Setor</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <SelectTrigger className="border p-2 rounded-md bg-white" >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {setores.length > 0 ? (setores.map((setor) => (
                        <SelectItem value={"" + setor.setorCod}>{setor.setorNome}</SelectItem>
                      ))) : null}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end mt-6">
          <Button
            onClick={(e) => setIsSaving(true)}
            isSubmitButton={true}
            className={"hover:bg-yellow-400 text-white " +
              (isSaveDisabled() ? "bg-[#CBD5E1] " : "bg-[#FFB503] ") +
              (isFormsUsuarioDefault() ? "invisible" : "visible")
            }
            disabled={isSaveDisabled()}
          >
            {isSaving ? "Salvando" : "Salvar"}
          </Button>
        </div>
        <ToastContainer position="top-center" autoClose={3000} />
      </form>
    </Form>

  );
}
