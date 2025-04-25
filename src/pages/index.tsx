"use client"
// General
import { useRouter } from 'next/router';
import Image from 'next/image'
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { useEffect, useState } from 'react';
import { AccessPass } from '@/lib/auth';

// Services
import { getRoleID, getUsuario, setLogIn } from '@/services/authService';

// Icons
import { FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";

// Styles
import styles from '../styles/Home.module.css';

// Components
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast, ToastContainer} from "react-toastify"


const formSchema = z.object({
    email: z.string()
      .min(1, { message: "Campo obrigatório." })
      .email({ message: "Por favor, insira um e-mail válido." }), 
    senha: z.string()
      .min(1, { message: "Campo obrigatório." })
});

export default function Home() {

    const router = useRouter();

    // State que registra o togle da senha
    const [isShowingPassword, setIsShowingPassword] = useState(true);

    const changeIsShowingPassword = () => {
        setIsShowingPassword(!isShowingPassword);
    }

  // Function to trigger the error toast
  const showErrorToast = () => {
    toast.error("Credênciais inválidas!", {
      position: "bottom-center",  // Position where the toast will appear
      autoClose: 5000,  // Auto-close after 5 seconds
      hideProgressBar: true,  // Hide progress bar
      closeOnClick: true,  // Allows closing toast on click
      pauseOnHover: true,  // Pauses the toast on hover
      draggable: true,  // Makes the toast draggable
      progress: undefined,  // Can be used to specify progress of a toast
    });
  };


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          senha: "",
        },
    })
     
      // 2. Define um controle de submit.
      async function onSubmit(values: z.infer<typeof formSchema>) {
        // Faz algo com os valores do form.
        // ✅ Isso vai ser tipadamente seguro e validado.
        if(values.email === null || values.senha === null)
            return null;
        

        const creds: AccessPass = {
            usuarioEmail: values.email,
            usuario_senha: values.senha
        }

        const res = await setLogIn(creds);

        const id = await getRoleID();
        
        if(res.status === 200)
            router.push("/inicio")

        else{
            showErrorToast()
        }

        

      }


    

  // Checa o tamanho da tela em pixels quando a janela é reajustada
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true); // Tamanho da tela mobile
      } else {
        setIsMobile(false); // Desktop ou em telas maiores
      }
    };

    handleResize(); // Checagem inicial do tamanho quando o componente é montado (onMount)
    window.addEventListener('resize', handleResize); // Escuta mudança do tamanho de tela

    return () => {
      window.removeEventListener('resize', handleResize); // Limpa o componente quando ele é descarregado (unMount)
    };
  }, []);
    
      const [isMobile, setIsMobile] = useState(false);

  // Checa o tamanho da tela em pixels quando a janela é reajustada
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true); // Tamanho da tela mobile
      } else {
        setIsMobile(false); // Desktop ou em telas maiores
      }
    };

    handleResize(); // Checagem inicial do tamanho quando o componente é montado (onMount)
    window.addEventListener('resize', handleResize); // Escuta mudança do tamanho de tela

    return () => {
      window.removeEventListener('resize', handleResize); // Limpa o componente quando ele é descarregado (unMount)
    };
  }, []);
    

    return(
        <div>

        {!isMobile ? (     
        
        <div style={{display: 'flex', flexDirection: 'row', justifyContent: 'space-between'}}>

        <div className={styles.headder1}>
            <div className='float-left pl-12 pr-3'>
                <Image 
                src="/images/Logo.svg"
                alt="Logo"
                width={90}
                height={63}
                />
            </div>
            <div>
                <p className={styles.headderTittle}>Bee<span style={{color: '#FFB503'}}>On</span>Time</p>
                <p className='text-xs'>O ritmo perfeito da sua equipe, como em uma colmeia!</p>
            </div>
        </div>

        <div className={styles.headder2}>
            <div>
                <p className='text-sm'>É novo aqui? Cadastre sua empresa!</p>
            </div>
            <div className='pr-12 pl-5 pt-5'>
                <Button className="mt-6 mb-12" style={{boxShadow: '0px 10px 25px 0px rgba(123, 104, 238, 50%)'}}
                onClick={() => router.push("/cadastro")}>
                    Cadastro
                </Button>
            </div>
        </div>

        </div>
        ): (
        <div style={{display: 'flex', flexDirection: 'row'}}>

        <div className={styles.headder1}>
            <div className='pl-12 pr-3'>
                <Image 
                src="/images/Logo.svg"
                alt="Logo"
                width={90}
                height={63}
                />
            </div>
            <div className='pr-12'>
                <p className={styles.headderTittle}>Bee<span style={{color: '#FFB503'}}>On</span>Time</p>
                <p className='text-xs'>O ritmo perfeito da sua equipe, como em uma colmeia!</p>
            </div>
        </div>
        </div>
        )}


        <div className={styles.container}>
            <Card className={styles.card}>
                <CardHeader className={styles.cardTitle}>
                    <CardTitle className='text-3xl'>Bem vindo de volta!</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                        {/* <form onSubmit={onSubmitTest} className="space-y-3"> */}
                            <FormField
                                control={form.control}
                                name="email"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>E-mail</FormLabel>
                                        <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                <i><FaRegEnvelope /></i>
                                            </span>
                                            <Input className='w-full pl-12' placeholder='SkyFly'  {...field} />
                                        </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="senha"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Senha</FormLabel>
                                        <FormControl>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                                                <i><HiOutlineLockClosed /></i>
                                            </span>
                                            <button className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                                                type='button'
                                                onClick={() => changeIsShowingPassword()}>
                                                {!isShowingPassword ? (<FaRegEye />) : (<FaRegEyeSlash />)}
                                            </button>
                                            {isShowingPassword ? (
                                                <Input className='w-full pl-12 pr-12' placeholder='Educação e Tecnologia' type={'password'} {...field} />
                                            ) : 
                                            (<Input className='w-full pl-12 pr-12' placeholder='Educação e Tecnologia' {...field} />)}
                                            
                                        </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            {/* <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }: { field: import("react-hook-form").ControllerRenderProps<z.infer<typeof formSchema>, "rememberMe"> }) => (
                                    <FormItem>
                                        <FormControl>
                                            <label className="inline-flex items-center">
                                                <input type="checkbox" checked={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} className="form-checkbox h-4 w-4 text-blue-600" />
                                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                                            </label>
                                        </FormControl>
                                    </FormItem>
                                )}
                            /> */}
                        <div className='pb-2'>
                        <Button 
                            isSubmitButton={true}  // Passando isSubmitButton como true para que seja do tipo submit
                            className="w-full mt-6 mb-2"
                        > 
                            Entrar
                          </Button>
                        </div>
                        </form>
                        
                        {/* <div className='w-full text-center mt-2'>
                        <a href="" className='text-sm' style={{textAlign: 'center'}}>
                            Esqueceu sua senha? Redefina aqui!
                        </a>
                        </div> */}



                        {isMobile ? (
                            <div className='w-full text-center mb-2'>
                            <a className='text-sm' style={{textAlign: 'center'}} onClick={() => router.push("/cadastro")}>
                                É novo aqui? Cadastre sua empresa!
                            </a>
                            </div>
                        ) : (null)}

                    </Form>
                </CardContent>
            </Card>
        </div>

        <ToastContainer />
        </div>
    )
}