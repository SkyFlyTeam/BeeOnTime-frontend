"use client"
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';

//Icons
import { FaRegEnvelope } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";
import { FaRegEye } from "react-icons/fa";
import { FaRegEyeSlash } from "react-icons/fa";

import Image from 'next/image'


 
import { z } from "zod"
 
const formSchema = z.object({
    email: z.string()
      .min(2, { message: "O e-mail deve ter pelo menos 2 caracteres." })
      .email({ message: "Por favor, insira um e-mail válido." }), // You can add more specific validation like email format
    senha: z.string()
      .min(2, { message: "A senha deve ter pelo menos 2 caracteres." })
  });

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/src/components/ui/card"
import { Button } from '@/src/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '@/src/components/ui/input';
import { sources } from 'next/dist/compiled/webpack/webpack';
import { url } from 'inspector';
import { useEffect, useState } from 'react';
//HERE// import { useState } from 'react';

export default function Home() {

    const router = useRouter();

      // State que registra o togle da senha
    const [isShowingPassword, setIsShowingPassword] = useState(true);

    const changeIsShowingPassword = () => {
        setIsShowingPassword(!isShowingPassword);
    }


    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          senha: "",
        },
    })
     
      // 2. Define um controle de submit.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Faz algo com os valores do form.
        // ✅ Isso vai ser tipadamente seguro e validado.
        console.log(values)
      }
    
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
                onClick={() => router.push("/about")}>
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
                        <Button type="submit" className="w-full mt-6 mb-2">
                            Entrar
                        </Button>
                        </form>
                        
                        {/* <div className='w-full text-center mt-2'>
                        <a href="" className='text-sm' style={{textAlign: 'center'}}>
                            Esqueceu sua senha? Redefina aqui!
                        </a>
                        </div> */}



                        {isMobile ? (
                            <div className='w-full text-center mb-2'>
                            <a href='' className='text-sm' style={{textAlign: 'center'}}>
                                É novo aqui? Cadastre sua empresa!
                            </a>
                            </div>
                        ) : (null)}

                    </Form>
                </CardContent>
            </Card>
        </div>


        </div>
    )
}