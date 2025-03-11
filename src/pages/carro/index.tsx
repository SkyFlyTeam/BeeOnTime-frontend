import { useRouter } from 'next/router';

export default function Carro() {
    const router = useRouter();

    return(
        <div>
            <h1>Carro de ID: 0</h1>
            <button onClick={() => router.push('/carro/1')}>
                Change ID
            </button>
        </div>
    )
}