"use client";
// General
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Services
import { usuarioServices } from "@/services/usuarioServices";

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Components
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const formSchema = z.object({
  nome: z.string().min(1, { message: "Campo obrigatório." }),
  cpf: z.string().min(1, { message: "Campo obrigatório." }),
  email: z.string()
    .min(1, { message: "Campo obrigatório." })
    .email({ message: "Por favor, insira um e-mail válido." }),
  dataNascimento: z.string().min(1, { message: "Campo obrigatório." }),
  dataContratacao: z.string().min(1, { message: "Campo obrigatório." }),
  tipoContrato: z.string().min(1, { message: "Campo obrigatório." }),
  cargo: z.string().min(1, { message: "Campo obrigatório." }),
  nivelAcesso: z.string().min(1, { message: "Campo obrigatório." }),
  setor: z.string().min(1, { message: "Campo obrigatório." }),
  status: z.boolean(),
});

interface EditarFuncionarioFormProps {
    usuarioInfo: Usuario;
  }

export default function EditarFuncionarioForm({usuarioInfo}: EditarFuncionarioFormProps) {

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nome: usuarioInfo.usuario_nome,
      cpf: usuarioInfo.usuario_cpf,
      email: usuarioInfo.usuario_email as string,
      dataNascimento: usuarioInfo.usuario_DataNascimento instanceof Date ? usuarioInfo.usuario_DataNascimento.toISOString().split('T')[0] : usuarioInfo.usuario_DataNascimento,
      dataContratacao: usuarioInfo.usuario_dataContratacao instanceof Date ? usuarioInfo.usuario_dataContratacao.toISOString().split('T')[0] : usuarioInfo.usuario_dataContratacao,
      tipoContrato: "",
      cargo: usuarioInfo.usuario_cargo,
      nivelAcesso: "",
      setor: "",
      status: true,
    },
  });

  return (
    <div className="border p-6" style={{ width: "100%", display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <Form {...form}>
        <form>
          <div className="flex flex-row flex-wrap gap-6">
            {/* Status Toggle */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <FormControl>
                    <div className="flex items-center">
                      {/* <Switch checked={field.value} onCheckedChange={field.onChange} /> */}
                      <span className="ml-3">{field.value ? "Usuário ativo" : "Usuário inativo"}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Name */}
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* CPF */}
            <FormField
              control={form.control}
              name="cpf"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>CPF</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Nascimento */}
            <FormField
              control={form.control}
              name="dataNascimento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Nascimento</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Data de Contratação */}
            <FormField
              control={form.control}
              name="dataContratacao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Data de Contratação</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Contrato */}
            <FormField
              control={form.control}
              name="tipoContrato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Contrato</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Cargo */}
            <FormField
              control={form.control}
              name="cargo"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nível de Acesso */}
            <FormField
              control={form.control}
              name="nivelAcesso"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nível de Acesso</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Setor */}
            <FormField
              control={form.control}
              name="setor"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Setor</FormLabel>
                  <FormControl>
                    <Input placeholder="" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end mt-6">
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-400 text-white">
              Salvar
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
