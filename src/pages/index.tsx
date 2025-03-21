"use client"
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';

import { FaRegEnvelope } from "react-icons/fa";
import { HiOutlineLockClosed } from "react-icons/hi";

import Image from 'next/image'


 
import { z } from "zod"
 
const formSchema = z.object({
  email: z.string().min(2).max(50),
  senha: z.string().min(2).max(50),
})

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

    //HERE// const [username, setUsername] = useState()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          email: "",
          senha: "",
        },
    })
     
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }
    
      const [isMobile, setIsMobile] = useState(false);

  // Check screen size on mount and when the window is resized
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsMobile(true); // Mobile screen size
      } else {
        setIsMobile(false); // Desktop or larger screen size
      }
    };

    handleResize(); // Initial check on component mount
    window.addEventListener('resize', handleResize); // Listen for window resizing

    return () => {
      window.removeEventListener('resize', handleResize); // Clean up on component unmount
    };
  }, []);
    

    return(
        <div>

        {!isMobile ? (     
        
        <div style={{display: 'flex', flexDirection: 'row'}}>

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
                <p className={styles.headderTittle}>BeeOnTime</p>
                <p className='text-xs'>O ritmo perfeito da sua equipe, como em uma colmeia!</p>
            </div>
        </div>

        <div className={styles.headder2}>
            <div>
                <p className='text-sm'>É novo aqui? Cadastre sua empresa!</p>
            </div>
            <div className='pr-12 pl-5 pt-5'>
                <Button className=" bg-yellow-400 text-black mt-6 mb-12" style={{boxShadow: ' 0px 5px 50px 1px #1a202c'}}
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
                <p className={styles.headderTittle}>BeeOnTime</p>
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
                                                {/* Replace with your icon */}
                                                <i><FaRegEnvelope /></i>
                                            </span>
                                            <Input className='w-full pl-12'  {...field} />
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
                                                {/* Replace with your icon */}
                                                <i><HiOutlineLockClosed /></i>
                                            </span>
                                            <Input className='w-full pl-12' type={'password'} {...field} />
                                        </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </form>
                        
                        <div className='w-full text-center mt-2'>
                        <a href="" className='text-sm' style={{textAlign: 'center'}}>
                            Esqueceu sua senha? Redefina aqui!
                        </a>
                        </div>

                        <Button type="submit" className="w-full bg-yellow-400 text-black mt-6 mb-2"
                        onClick={() => router.push("/about")}>
                            Entrar
                        </Button>

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