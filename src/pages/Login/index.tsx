
import { AccessPass } from '@/src/lib/auth';
import { setLogIn } from '@/src/services/authService';
import { useRouter } from 'next/router';
import { FormEvent, useState, useEffect } from 'react';




export default function Login() {
    const [pending, setPending] = useState<boolean>(false);
    const router = useRouter()





    // onSubmit(values: z.infer<typeof formSchema>) não ativa a função. Apenas como "FormEvent<HTMLFormEvent>" que funcinou.
    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setPending(true);
        
        const formData = new FormData(e.currentTarget);
        if(formData.get("funcEmail") === null || formData.get("funcSenha") === null)
            return null;

        const creds: AccessPass = {
            usuarioEmail: formData.get("funcEmail") as String,
            usuario_senha: formData.get("funcSenha") as String
        }

        const res = await setLogIn(creds);
        
        if(res.status === 200)
            router.push("/inicio")
        setPending(false);
    }






    return (
        <main>
            <form onSubmit={onSubmit}>

                <input type="text" name="funcEmail" /><br /><br />
                <input type="text" name="funcSenha" /><br />
                <button type="submit" disabled={pending}>{pending ? "Sending..." : "Submit"}</button>
                <br />
                <br />
            </form>
        </main>
    )

}