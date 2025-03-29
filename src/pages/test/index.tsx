import { usePathname } from 'next/navigation';
import Link from "next/link"
import { useEffect, useState } from 'react';
import { getUserRoleID } from '@/src/services/authService';
import { AxiosResponse } from 'axios';




export default function Home() {
    //
    //
    //
    const [hasMounted, setHasMounted] = useState(false);
    //
    useEffect(() => {
        setHasMounted(true);
    }, []);
    //
    if (!hasMounted) {
        return null;
    }
    //
    //
    //

    //Teste para Auth Token
    async function hasAuth() {
        try {
            const res = await getUserRoleID();
            if(res.status == 200)
                alert("true\n\n200: "+res.data.role)
            else
                alert("false")
        }
        catch(error){
            alert((error as AxiosResponse).data)
        }
    }

    //Teste para Bearer Token
    async function tester() {
        try {
            const res = await fetch('/auth/user', {
                method: 'GET',
                headers: {
                    'content-type': 'application/json'
                }
            })
            if (res.ok) {
                const tester = await res.json();
                alert(tester.role)
            }
            else {
                alert(await res.text())
            }
        } catch (error) {

        }
    }


    return (
        <main>
            <Link href="/test">TEST</Link>
            <br />
            <div>This is: {usePathname()}</div>
            <br />
            <br />
            <button onClick={hasAuth}>AUTH?</button>
            <br />
            <button onClick={tester}>CLICKME</button>
        </main>
    );
}
