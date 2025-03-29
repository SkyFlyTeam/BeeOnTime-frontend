"use client";
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';
import { FaRegEnvelope, FaRegEye, FaRegEyeSlash } from "react-icons/fa";
import Image from 'next/image';
import { z } from "zod";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Button } from '@/src/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/src/components/ui/form';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Input } from '@/src/components/ui/input';
import { useEffect, useState } from 'react';
import CadastroEmpresaForm from '../components/custom/CadastroEmpresa';

const formSchema = z.object({
    email: z.string().min(1, { message: "Campo obrigatório." }).email({ message: "Por favor, insira um e-mail válido." }),
    senha: z.string().min(1, { message: "Campo obrigatório." })
});

export default function Home() {
    const router = useRouter();
    const [isShowingPassword, setIsShowingPassword] = useState(true);
    const changeIsShowingPassword = () => setIsShowingPassword(!isShowingPassword);
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: { email: "", senha: "" },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values);
    }

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', width: '100%' }}>
            {!isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', width: '100%' }}>
                    <div className={styles.headder1}>
                        <div className='float-left pl-12 pr-3'>
                            <Image src="/images/Logo.svg" alt="Logo" width={90} height={63} />
                        </div>
                        <div>
                            <p className={styles.headderTittle}>Bee<span style={{ color: '#FFB503' }}>On</span>Time</p>
                            <p className='text-xs'>O ritmo perfeito da sua equipe, como em uma colmeia!</p>
                        </div>
                    </div>
                    <div className={styles.headder2}>
                        <div><p className='text-sm'>Já tem conta? Faça seu login!</p></div>
                        <div className='pr-12 pl-5 pt-5'>
                            <Button className="mt-6 mb-12" style={{ boxShadow: '0px 10px 25px 0px rgba(123, 104, 238, 50%)' }} onClick={() => router.push("/")}>Login</Button>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', width: '100%' }}>
                    <div className={styles.headder1}>
                        <div className='pl-12 pr-3'>
                            <Image src="/images/Logo.svg" alt="Logo" width={90} height={63} />
                        </div>
                        <div className='pr-12'>
                            <p className={styles.headderTittle}>Bee<span style={{ color: '#FFB503' }}>On</span>Time</p>
                            <p className='text-xs'>O ritmo perfeito da sua equipe, como em uma colmeia!</p>
                        </div>
                    </div>
                </div>
            )}
          <CadastroEmpresaForm isMobile = {isMobile}/>
        </div>
    );
}