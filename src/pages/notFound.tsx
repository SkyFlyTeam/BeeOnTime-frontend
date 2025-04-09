import Image from 'next/image'

export default function notFound(){

    return(
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems:'center', height:'100%'}}>
        <Image
            src="/images/sem_conteudo.svg"
            alt="sem_conteudo"
            width={512}
            height={512}
         />
        <p>Ops! Parece que não tem nada aqui!</p>
        </div>
    )
}