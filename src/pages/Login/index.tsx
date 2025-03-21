"use client"
import { useRouter } from 'next/router';

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
//HERE// import { useState } from 'react';

import { z } from "zod"
import { FormEvent, useState } from 'react';
import { useFormStatus } from 'react-dom';
const formSchema = z.object({
    username: z.string().min(2).max(50),
    password: z.string().min(2).max(50),
    rememberMe: z.boolean().default(false),
})



export default function Login() {
    const { pending } = useFormStatus();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
        },
    })


    async function test(event: FormEvent<HTMLFormElement>){
        event.preventDefault();
        const formData = new FormData(event.currentTarget)
        console.log("And so it begins")
        const submitData = { 
            funcEmail: formData.get("funcEmail"),
            funcSenha: formData.get("funcSenha")
        }

        console.log(submitData)
        console.log(JSON.stringify(submitData))
        try {
            const res = await fetch('http://localhost:8080/auth/login', {
                method: 'POST',
                body: JSON.stringify(submitData),
                headers: {
                    'content-type': 'application/json'
                }
            })
            if (res.ok) {
                console.log("Yeai!")
            } else {
                console.log("Oops! Something is wrong.")
            }
            console.log(res.json)
        } catch (error) {
            console.log(error)
        }
    }





return (
    <main>
        <form onSubmit={test}>
            <input type="text" name="funcEmail"/><br /><br />
            <input type="text" name="funcSenha"/><br />
            <button type="submit" disabled={pending}>{pending ? "Sending..." : "Submit"}</button>
        </form>
    </main>
)

}