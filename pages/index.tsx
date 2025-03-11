"use client"
import styles from '../styles/Home.module.css';
import { useRouter } from 'next/router';

 
import { z } from "zod"
 
const formSchema = z.object({
  username: z.string().min(2).max(50),
  password: z.string().min(2).max(50),
  rememberMe: z.boolean().default(false),
})

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

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Input } from '@/components/ui/input';
import { useState } from 'react';

export default function Home() {

    const router = useRouter();

    const [username, setUsername] = useState()

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
          username: "",
          password: "",
          rememberMe: false,
        },
    })
     
      // 2. Define a submit handler.
      function onSubmit(values: z.infer<typeof formSchema>) {
        // Do something with the form values.
        // ✅ This will be type-safe and validated.
        console.log(values)
      }
    

    return(
        <div className={styles.container}>
            <Card className={styles.card}>
                <CardHeader>
                    <CardTitle>Sign in</CardTitle>
                    <CardDescription>Fill in the fields.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                            <FormField
                                control={form.control}
                                name="username"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Username</FormLabel>
                                        <FormControl>
                                            <Input  {...field} />
                                        </FormControl>
                                        <FormDescription>This is your public display name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="password"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Password</FormLabel>
                                        <FormControl>
                                            <Input type={'password'} {...field} />
                                        </FormControl>
                                        <FormDescription>This is your public display name.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="rememberMe"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <label className="inline-flex items-center">
                                                <input type="checkbox" checked={field.value} onChange={field.onChange} onBlur={field.onBlur} name={field.name} ref={field.ref} className="form-checkbox h-4 w-4 text-blue-600" />
                                                <span className="ml-2 text-sm text-gray-700">Remember me</span>
                                            </label>
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </form>
                    </Form>
                </CardContent>
                <CardFooter className="flex justify-between">
                    {/* Botão de login */}
                    <Button onClick={() => router.push('/about')}>Log in</Button>
                    <div className="flex flex-col">
                        {/* Links para 'Esqueci minha senha' e 'Cadastro novo' */}
                        <button className="text-sm text-blue-600 hover:underline" onClick={() => router.push('/forgot-password')}>Forgot password?</button>
                        <button className="text-sm text-blue-600 hover:underline" onClick={() => router.push('/signup')}>Create a new account</button>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}