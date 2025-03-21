import Link from 'next/link';
import { useRouter } from 'next/router';

export default function About() {
    const router = useRouter();

    return(
        <div>
            <h1>About page</h1>
            <p><Link href="/test">TEST</Link></p>
            <button onClick={() => router.push('/')}>
                Go to home
            </button>
        </div>
    )
}