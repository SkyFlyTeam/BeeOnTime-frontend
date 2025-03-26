// pages/blog/[id].tsx
import { useRouter } from 'next/router';

export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;

  return(
    <div>
    <h1>Carro de ID: {id}</h1>
    <button onClick={() => router.push(`/carro/${Number.parseInt(id!.toString()) + 1}`)}>
        Change ID
    </button>
    </div>
);
}
