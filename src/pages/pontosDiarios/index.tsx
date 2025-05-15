import { DataTable } from "@/components/ui/custom/datatablePDiarios";
import { PontoDiario } from "@/interfaces/pontoDiario";
import { getUsuario } from "@/services/authService";
import { useEffect, useState } from "react"
import { columnsPontoDiario } from "./columns";
import { relatorioPontoDiarioServices } from "@/services/relatorioPontoDiarioServices"; //

export default function PontosDiariosPagina() {
    const [usuarioNome, setUsuarioNome] = useState<string | undefined>();
    const [acessoCod, setAcessoCod] = useState<number>();
    const [usuarioInfo, setUsuarioInfo] = useState<any>();
    const [isLoading, setIsLoading] = useState(true);
    const [dados, setDados] = useState<PontoDiario[]>([]);

    useEffect(() => {
        getUser();
    }, []);

    const getUser = async () => {
        try {
            const user = await getUsuario();
            const usuario = user.data;
            setUsuarioNome(usuario.usuario_nome);
            setAcessoCod(usuario.nivelAcesso.nivelAcesso_cod);
            setUsuarioInfo(usuario);

            const hoje = new Date().toLocaleDateString("pt-BR", {
                timeZone: "America/Sao_Paulo"
            }); // formato yyyy-mm-dd
            const [diaString, mesString, anoString] = hoje.split('/')
            let dataAtual = `${anoString}-${mesString}-${diaString}`
            const dadosApi = await relatorioPontoDiarioServices.getPontoDiarioGeral(dataAtual); // chama o serviço
            
            
            setDados(dadosApi);
        } catch (error) {
            console.error("Erro ao buscar dados de ponto diário", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-10">
            <h1 className="text-4xl font-semibold">Olá, {usuarioNome}</h1>
            {!isLoading && (
                <div className="bg-white shadow-md rounded-xl p-6">
                    <DataTable
                        columns={columnsPontoDiario}
                        data={dados}
                        filterColumns={["nome"]}
                        title={`Pontos diários`}
                        dataDay={`Hoje, dia ${new Date().toLocaleDateString("pt-BR", { day: '2-digit', month: 'long' })}`}
                    />
                </div>
            )}
        </div>
    );
}
