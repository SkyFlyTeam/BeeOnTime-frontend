import { ChangeEvent, useEffect, useState } from 'react';
import { getUsuario, setLogIn } from '@/services/authService';
import { usuarioServices } from '@/services/usuarioService';
import { z } from 'zod';
import { AccessPass } from '@/lib/auth';
import { useToast } from '@/hooks/use-toast';
import { Toaster } from '@/components/ui/toaster';





interface perfilFormData {
    usuario_nome: string;
    usuarioEmail: string;
    usuario_senhaNova1: string;
    usuario_senhaNova2: string;
    usuario_senha: string;
}
const perfilSchema = z.object({
    usuario_nome: z.string().regex(/^[A-Za-z ]+$/i, "Apenas letras e espaço"),
    usuarioEmail: z.string().email("Email inválido"),
    usuario_senha: z.string().min(1, "Senha é obrigatório"),
});


//Pagina sem nada, ajeitar para a integração de tudo
export default function Page() {
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [usuarios, setUsuarios] = useState<any>({});
    const [usuarioInfo, setUsuarioInfo] = useState<any>();
    const [isLoading, setIsLoading] = useState(true); // Loading state
    const [formsData, setFormsData] = useState<perfilFormData>({
        usuario_nome: "",
        usuarioEmail: "",
        usuario_senhaNova1: "",
        usuario_senhaNova2: "",
        usuario_senha: ""
    })
    const { toast } = useToast();

    function toastDesc() {
        let msg = "";
        if (formsData.usuario_nome != "")
            msg += "Nome atualizado para \"" + formsData.usuario_nome + "\".";

        if (formsData.usuarioEmail != "") {
            if (formsData.usuario_nome != "")
                msg += "\n";
            msg += "Email atualizado para \"" + formsData.usuarioEmail + "\".";
        }
        return msg;
    }
    function resetForms() {
        setFormsData({
            usuario_nome: "",
            usuarioEmail: "",
            usuario_senhaNova1: "",
            usuario_senhaNova2: "",
            usuario_senha: ""
        })
    }

    function isSenhaDisabled() {
        return errors.usuario_senhaNova !== undefined || errors.usuario_senha !== undefined || isFormsSenhaEmpty();
    }

    function isPerfilDisabled() {
        return errors.usuarioEmail !== undefined || errors.usuario_nome !== undefined || isFormsPerfilEmpty();
    }

    function isFormsPerfilEmpty() {
        return (
            formsData.usuario_nome == "" &&
            formsData.usuarioEmail == ""
        );
    }
    function isFormsSenhaEmpty() {
        return (
            formsData.usuario_senhaNova1 == "" &&
            formsData.usuario_senhaNova2 == ""
        )
    }


    useEffect(() => {
        getAll();
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;

            setUsuarioInfo(usuario);
        } catch (error) {
            console.error("Error fetching user data", error);
        } finally {
            setIsLoading(false);
        }
    };

    const getAll = async () => {
        try {
            const usuarios = await usuarioServices.getAllUsuarios();

            setUsuarios(usuarios);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    }
    // Show loading message while fetching data
    if (isLoading) {
        return <div>Carregando...</div>;
    }



    function handleChangePerfil(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;
        let val = value;

        switch (name) {
            case "usuarioEmail":
                if (value == "") {
                    delete errors[name];
                    break;
                }


                const email = perfilSchema.partial().safeParse({ [name]: value, })
                if (!email.success) {
                    setErrors(email.error.errors.reduce((acc, err) => ({ ...acc, [err.path[0]]: err.message }), {}));
                    break;
                }

                if (value == usuarioInfo.usuarioEmail) {
                    setErrors((prev) => ({ ...prev, [name]: "Email igual ao usado." }))
                    break;
                }

                if (usuarios.some((us: { usuarioEmail: string }) => value == us.usuarioEmail)) {
                    setErrors((prev) => ({ ...prev, [name]: "Email já cadastrado" }));
                    break;
                }

                delete errors[name];
                break;
            // Adicionar outros filtros aqui
            case "usuario_nome":
                /*
                if (value.replace(/\s/g, "") == "" || value.replace(/\s+/g, " ").trim() != value) {
                    if(value == "")
                        delete errors[name];
                    else
                        setErrors((prev) => ({ ...prev, [name]: "Nome inválido, há espaços extras." }))
                    break;
                }*/
                if (value == "") {
                    delete errors[name];
                    break;
                }
                const nome = perfilSchema.partial().safeParse({ [name]: value, })
                if (!nome.success) {
                    setErrors(nome.error.errors.reduce((acc, err) => ({ ...acc, [err.path[0]]: err.message }), {}));
                    break;
                }

                if (usuarioInfo.usuario_nome == value) {
                    setErrors((prev) => ({ ...prev, [name]: "Nome igual ao anterior." }))
                    break;
                }
                delete errors[name];
                break;
            default:
        }

        setFormsData((prev) => ({ ...prev, [name]: value === null ? "" : value.replace(/\s+/g, " ").trim() }));
    }

    function handleChangeSenha(e: ChangeEvent<HTMLInputElement>) {
        const { name, value } = e.target;

        if ((name == "usuario_senhaNova1" && value != formsData.usuario_senhaNova2) ||
            (name == "usuario_senhaNova2" && value != formsData.usuario_senhaNova1)) {
            if (formsData.usuario_senha == "")
                setErrors((prev) => ({ ...prev, usuario_senha: "Necessário senha atual para mudar a senha." }));

            setErrors((prev) => ({ ...prev, usuario_senhaNova: "Campos da senha nova não são iguais." }));
        }
        else {
            if (name.includes("senhaNova"))
                delete errors["usuario_senhaNova"];

            if ((name == "usuario_senha" && (value != "" || formsData.usuario_senhaNova1 == "")) || (name != "usuario_senha" && (formsData.usuario_senha != "" || value == "")))
                delete errors["usuario_senha"];
            else
                setErrors((prev) => ({ ...prev, usuario_senha: "Necessário senha atual para mudar a senha." }));

        }
        setFormsData((prev) => ({ ...prev, [name]: value === null ? "" : value }));
    }


    async function handleSubmitPerfil(e: React.FormEvent) {
        e.preventDefault();




        const novoPerfil = Object.assign({}, usuarioInfo)
        novoPerfil.usuario_senha = "";
        novoPerfil.usuario_nome = (formsData.usuario_nome == "" ? usuarioInfo.usuario_nome : formsData.usuario_nome);
        novoPerfil.usuarioEmail = (formsData.usuarioEmail == "" ? usuarioInfo.usuarioEmail : formsData.usuarioEmail);

        const res = await usuarioServices.atualizarUsuario(novoPerfil)
        if (res) {


            try {
                const check = await fetch("/auth/login", {
                    method: "PUT",
                    headers: { 'Content-Type': 'application/json' },
                    body: novoPerfil.usuarioEmail,
                });
                if (check.status != 200)
                    return;
            } catch (error) { return; }

            toast({
                title: "Perfil atualizado!",
                className: "whitespace-pre",
                description: toastDesc(),
                variant: "default",
            });

            resetForms();
        }


        getUser();
    }

    async function handleSubmitSenha(e: React.FormEvent) {
        e.preventDefault();



        const novoPerfil = Object.assign({}, usuarioInfo);
        if (formsData.usuario_senhaNova1 != "") {
            const creds: AccessPass = {
                usuarioEmail: usuarioInfo.usuarioEmail,
                usuario_senha: formsData.usuario_senha
            }

            const check = await setLogIn(creds);
            if (check.status != 200) {
                setErrors((prev) => ({ ...prev, usuario_senha: "Senha errada." }));
                return;
            }
            novoPerfil.usuario_senha = formsData.usuario_senhaNova1;
        }
        else
            return;

        const res = await usuarioServices.atualizarUsuario(novoPerfil)
        if (res) {

            const creds: AccessPass = {
                usuarioEmail: usuarioInfo.usuarioEmail,
                usuario_senha: formsData.usuario_senhaNova1,
            }
            const check = await setLogIn(creds);
            if (check.status != 200) {
                setErrors((prev) => ({ ...prev, submitSenha: "Erro na atualização de senha." }));
                return;
            }

            toast({
                title: "Perfil atualizado!",
                description: "Senha alterada com sucesso!",
                variant: "default",
            });

            resetForms();
        }
        getUser();
    }




    return (
        <div className='flex flex-col gap-7 p-[16px]'>
            <Toaster />

            <h1 className='text-4xl font-semibold'>Gerenciar Perfil</h1>
            <div className="mx-auto">
                <form onSubmit={handleSubmitPerfil} className="flex flex-col">
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        <div className=" relative">
                            <label htmlFor="usuario_nome" className="mb-2">Nome</label>
                            <input
                                id="usuario_nome"
                                type="text"
                                name="usuario_nome"
                                placeholder={usuarioInfo.usuario_nome}
                                value={formsData.usuario_nome}
                                onChange={handleChangePerfil}
                                className="border p-2 rounded-md w-full"
                            />
                            {errors.usuario_nome && <p className="text-red-500 absolute top-15">{errors.usuario_nome}</p>}
                        </div>
                        <div className=" relative">
                            <label htmlFor="usuarioEmail" className="mb-2">Email</label>
                            <input
                                id="usuarioEmail"
                                type="text"
                                name="usuarioEmail"
                                placeholder={usuarioInfo.usuarioEmail}
                                value={formsData.usuarioEmail}
                                onChange={handleChangePerfil}
                                className="border p-2 rounded-md w-full"
                            />
                            {errors.usuarioEmail && <p className="text-red-500 absolute top-15">{errors.usuarioEmail}</p>}
                        </div>
                        <div className="">
                            <label htmlFor="usuario_cargo" className="mb-2">Cargo</label>
                            <input
                                id="usuario_cargo"
                                type="text"
                                name="usuario_cargo"
                                placeholder={usuarioInfo.usuario_cargo}
                                onChange={handleChangePerfil}
                                className="border p-2 rounded-md w-full"
                                disabled
                            />
                        </div>
                        <div className="">
                            <label htmlFor="setorNome" className="mb-2">Setor</label>
                            <input
                                id="setorNome"
                                type="text"
                                name="setorNome"
                                placeholder={usuarioInfo.setor.setorNome}
                                onChange={handleChangePerfil}
                                required
                                className="border p-2 rounded-md w-full"
                                disabled
                            />
                        </div>
                        <div className=" flex flex-cols gap-4">
                            <div className="flex-grow-0 flex-shrink-0 w-32">
                                <label htmlFor="usuarioTipoContratacao" className="mb-2">Tipo de Contrato</label>
                                <input
                                    id="usuario_cargo"
                                    type="text"
                                    name="usuarioTipoContratacao"
                                    placeholder={usuarioInfo.usuarioTipoContratacao}
                                    onChange={handleChangePerfil}
                                    className="border p-2 rounded-md w-full"
                                    disabled
                                />
                            </div>
                            <div className="flex-grow-0 w-full">
                                <label htmlFor="nivelAcesso_nome" className="mb-2">Nível de Acesso</label>
                                <input
                                    id="nivelAcesso_nome"
                                    type="text"
                                    name="nivelAcesso_nome"
                                    placeholder={usuarioInfo.nivelAcesso.nivelAcesso_nome}
                                    onChange={handleChangePerfil}
                                    className="border p-2 rounded-md w-full"
                                    disabled
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-row flex-warp mt-[30px] justify-end">

                        {errors.submitPerfil && <p className="text-red-500 absolute top-15">{errors.submitPerfil}</p>}
                        <button
                            type="submit"
                            className={"text-black border p-2 rounded-md " + (isPerfilDisabled() ? "" : "bg-[#FFB503] ") + (isFormsPerfilEmpty() ? "invisible" : "visible")}
                            disabled={isPerfilDisabled()}
                        >Salvar</button>
                    </div>
                </form>

                <form onSubmit={handleSubmitSenha} className="flex flex-col gap-5">
                    <h2 className='text-2xl font-semibold'>Alterar Senha</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                        <div className="col-1 flex flex-col gap-5">
                            <div className="relative">
                                <label htmlFor="usuario_senha" className="mb-2">Senha Atual</label>
                                <input
                                    id="usuario_senha"
                                    type="password"
                                    name="usuario_senha"
                                    value={formsData.usuario_senha}
                                    onChange={handleChangeSenha}
                                    required
                                    className="border p-2 rounded-md w-full"
                                />
                                {errors.usuario_senha && <p className="text-red-500 absolute top-15">{errors.usuario_senha}</p>}
                            </div>
                            <div className="">
                                <label htmlFor="usuario_senhaNova1" className="mb-2">Senha Nova</label>
                                <input
                                    id="usuario_senhaNova1"
                                    type="password"
                                    name="usuario_senhaNova1"
                                    value={formsData.usuario_senhaNova1}
                                    onChange={handleChangeSenha}
                                    className="border p-2 rounded-md w-full"
                                />
                            </div>
                            <div className="relative">
                                <label htmlFor="usuario_senhaNova2" className="mb-2">Repita Senha</label>
                                <input
                                    id="usuario_senhaNova2"
                                    type="password"
                                    name="usuario_senhaNova2"
                                    value={formsData.usuario_senhaNova2}
                                    onChange={handleChangeSenha}
                                    className="border p-2 rounded-md w-full"
                                />
                                {errors.usuario_senhaNova && <p className="text-red-500 absolute top-30">{errors.usuario_senhaNova}</p>}
                            </div>

                            <div className="flex flex-row justify-start mt-5">
                                <button
                                    type="submit"
                                    className={"text-black border p-2 rounded-md " + (isSenhaDisabled() ? "" : "bg-[#FFB503] ") + (isFormsSenhaEmpty() ? "invisible" : "visible")}
                                    disabled={isSenhaDisabled()}
                                >Alterar</button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div >
    );
}



