import { DataTable } from '@/components/ui/datatable';
import { Skeleton } from '@/components/ui/skeleton';
import { bancoHorasDiarioFunc } from '@/interfaces/bancoHoras';
import { Usuario } from '@/interfaces/usuario';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { columnsDaily } from './columns';
import { getUsuario } from '@/services/authService';
import { relatorioBancoHorasServices } from '@/services/relatorioBancoHoras';
import { usuarioServices } from '@/services/usuarioServices';



const BancoHorasDiario = () => {
    const router = useRouter();
    const { id, data } = router.query;  // Pegando o id e a data da URL

    const [bancoHorasDiario, setBancoHorasDiario] = useState<bancoHorasDiarioFunc[] | null>(null)
    const [loading, setLoading] = useState(true);

    const [usuario, setUsuario] = useState<Usuario | null>(null);
    const [acessoCod, setAcessoCod] = useState<number | null>(null);

    const [colaborador, setColaborador] = useState<Usuario | null>(null);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;
            setUsuario(usuario);
            setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    // Buscar relatório de banco de horas de um usuário de um mês
    const fetchBancoHorasDiarias = async (date: string, usuario: Usuario) => {
        try{
            const data = await relatorioBancoHorasServices.getRelatorioDiarioFunc(date, usuario!);
            const bancoHorasDiario = data as bancoHorasDiarioFunc[];
            const bancoHorasDiarioOrganizado = bancoHorasDiario
                .filter((banco) => new Date(banco.data) <= new Date(date))
                .sort(  
                    (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
                );
                
            setBancoHorasDiario(bancoHorasDiarioOrganizado);
        }catch (err) {
            console.error("Erro ao carregar o relatório de banco de horas diarias.");
        }
    }

    useEffect(() => {
        if (bancoHorasDiario && bancoHorasDiario.length > 0) {
            setLoading(false);
        }else if(bancoHorasDiario && bancoHorasDiario.length == 0){
            setLoading(false);
        }
    }, [bancoHorasDiario])

    // Buscar colaborador (em caso do usuário logado ser ADMIN)
    const fetchColaborar = async () => {
        try{
            const data = await usuarioServices.getUsuarioById(parseInt(id as string));
            setColaborador(data as Usuario);
        }catch (err) {
            console.error("Erro ao carregar o relatório de banco de horas diarias.");
        }
    }

    useEffect(() => {
        getUser();
    }, [])

    useEffect(() => {
        if (data) {
            const dateObj = new Date(data as string);
            const dataFormatada = new Date(Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
            )).toISOString().split('T')[0];  

            if(acessoCod === 0 || (acessoCod == 1 && id != usuario?.usuario_cod)){
                fetchColaborar();
            } else {
                fetchBancoHorasDiarias(dataFormatada, usuario!);
            }
        }
    }, [acessoCod, usuario, data, id])

    useEffect(() => {
        if(colaborador){
            const dateObj = new Date(data as string);
            const dataFormatada = new Date(Date.UTC(
            dateObj.getFullYear(),
            dateObj.getMonth(),
            dateObj.getDate()
            )).toISOString().split('T')[0];  

            fetchBancoHorasDiarias(dataFormatada, colaborador);
        }
    }, [colaborador, data])

    const SkeletonRow = () => (
        <div className="flex flex-row gap-6 mt-10 justify-between">
          <Skeleton className="bg-gray-200 w-24 h-10" />
          <Skeleton className="bg-gray-200 w-24 h-10" />
          <Skeleton className="bg-gray-200 w-24 h-10" />
          <Skeleton className="bg-gray-200 w-72 h-10" />
          <Skeleton className="bg-gray-200 w-48 h-10" />
          <Skeleton className="bg-gray-200 w-32 h-10" />
        </div>
    );

    return(
        loading ? (
            <div className="flex flex-col  p-6 md:p-9">
                <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">

                    <div className="flex flex-row justify-between">
                    <Skeleton className="bg-gray-200 w-80 h-10" />
                    <Skeleton className="bg-gray-200 w-96 h-10" />
                    </div>
                    {[...Array(5)].map((_, idx) => (
                    <SkeletonRow key={idx} />
                    ))}
                </div>
            </div>
        ) : (
            <>  
                <div className="flex w-full justify-between items-center mb-4">
                    <h1 className="text-xl md:text-3xl font-semibold ">
                        Banco de Horas
                        {(acessoCod == 0 || (acessoCod == 1 && id != usuario?.usuario_cod)) && ` - ${colaborador?.usuario_nome}`}
                    </h1>
                </div>
            
                <div className="min-w-fit bg-white shadow-[4px_4px_19px_0px_rgba(0,0,0,0.05)] flex flex-col items-center justify-center gap-4 rounded-xl p-6">
                    <DataTable 
                        columns={columnsDaily} 
                        data={bancoHorasDiario!} 
                        filterColumns={[]} 
                        title={`Mês de ${new Date(data as string).toLocaleString('pt-BR', { month: 'long' })}`}
                        showSearchBar={false}
                    />
                </div>
            </>
        )
    )
};

export default BancoHorasDiario;
