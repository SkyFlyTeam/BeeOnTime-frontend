import { useRouter } from 'next/router';

export default function About() {
    const router = useRouter();

    return(
        <div>
            <h1>About page</h1>
            <button onClick={() => router.push('/')}>
                Go to home
            </button>
        </div>
    )
}