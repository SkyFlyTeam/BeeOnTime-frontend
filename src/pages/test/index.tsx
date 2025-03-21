import { usePathname } from 'next/navigation';
import Link from "next/link"
import { useEffect, useState } from 'react';




export default function Home() {

    //
    //
    //
    const [hasMounted, setHasMounted] = useState(false);
    useEffect(() => {
        setHasMounted(true);
    }, []);
    if (!hasMounted) {
        return null;
    }
    //
    //
    //


    return (
        <main>
            <Link href="/test">TEST</Link>
            <div>This is: {usePathname()}</div>
        </main>
    );
}
