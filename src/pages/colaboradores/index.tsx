// General
import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';

// Interfaces
import { Usuario } from "@/interfaces/usuario";

// Services

import { usuarioServices } from "@/services/usuarioServices";

// Components
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import { toast, ToastContainer } from "react-toastify";
import CadastroUsuario from "@/components/custom/ModalCadastroUsuario/CadastroUsuario";

// Icons
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";

// Styles
import 'react-toastify/dist/ReactToastify.css';
import UsuarioInfo from "@/interfaces/usuarioInfo";

// import styles from '@/styles/Colaboradores.module.css'
// import CadastroUsuario from "@/components/CadastroUsuario";
import { getUsuario } from "@/services/authService";
import { Skeleton } from "@/components/ui/skeleton";
// import styles from './Colaboradores.module.css';

export default function Colaboradores() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]); // Garante que seja um array vazio inicialmente
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [thisUser, setThisUser] = useState<Usuario>();

  const [isOpen, setIsOpen] = useState(false);

  const router = useRouter();

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioServices.getAllUsuarios();
      setThisUser(await getUser())
      setUsuarios(Array.isArray(data) ? data : []);  // Garantindo que o valor seja um array
    } catch (err) {
      setError("Erro ao carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

  const getUser = async () => {
    const user = await getUsuario();
    console.log(user);
    return user.data;
  }

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const showToast = (success: boolean) => {
    success ? showSucessToast() : showErrorToast();
  }

  const showSucessToast = () => {
    toast.success("Colaborador cadastrado com sucesso!", {
      position: "top-center",
    });
  };

  const showErrorToast = () => {
    toast.error("Erro ao cadastrar colaborador.", {
      position: "top-center",
    });
  };

  useEffect(() => {
    if (!isOpen) {
      fetchUsuarios();
    }
  }, [isOpen]);

  const handleViewUser = (usuarioId: number) => {
    console.log(`Ver detalhes do usuário com ID: ${usuarioId}`);
    router.push(`/historico-ponto/${usuarioId}`)
  };

  const SkeletonRow = () => (
    <div className="flex flex-row gap-7 mt-10">
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
      <Skeleton className="bg-gray-200 w-72 h-10" />
      <Skeleton className="bg-gray-200 w-48 h-10" />
      <Skeleton className="bg-gray-200 w-32 h-10" />
      <Skeleton className="bg-gray-200 w-24 h-10" />
    </div>
  );

  if (loading) {
    return (
      <div>
        <div className="container mx-auto px-4 flex justify-between">
          <h1 className="text-3xl font-bold text-left">Colaboradores</h1>
          <button
            onClick={() => setIsOpen(true)}
            className="bg-[#FFB503] text-black py-1 px-8 rounded-md hover:bg-[#FFCB50] transition-colors"
          >
            Adicionar
          </button>
        </div>
        <div className="w-full rounded-xl mt-5 bg-gray-100 p-5">
          {/* <Skeleton className="h-[3rem] w-full rounded-xl mt-5" /> */}
          <div className="flex flex-row gap-7">
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
            <Skeleton className="bg-gray-200 w-72 h-10" />
            <Skeleton className="bg-gray-200 w-48 h-10" />
            <Skeleton className="bg-gray-200 w-32 h-10" />
            <Skeleton className="bg-gray-200 w-24 h-10" />
          </div>
          {[...Array(5)].map((_, idx) => (
            <SkeletonRow key={idx} />
          ))}


        </div>
      </div>

    );
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 flex justify-between">
        <h1 className="text-3xl font-bold text-left">Colaboradores</h1>
        <button
          onClick={() => setIsOpen(true)}
          className="bg-[#FFB503] text-black py-1 px-8 rounded-md hover:bg-[#FFCB50] transition-colors"
        >
          Adicionar
        </button>
      </div>

      {isOpen && (
        <CadastroUsuario onClose={() => setIsOpen(false)} onSave={showToast} />
      )}

      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg mt-5">
        <div className="overflow-x-auto">
          {/* Desktop - Tabela horizontal */}
          <div className="hidden md:block">
            <Table className="min-w-[900px] w-full">
              <TableHeader>
                <TableRow>
                  {["NOME", "CARGO", "SETOR", "CARGA HORÁRIA DIÁRIA", "CONTRATO", "NÍVEL ACESSO", "AÇÕES"].map((header, idx) => (
                    <TableHead
                      key={idx}
                      className="border border-gray-200 text-center font-bold text-black text-base p-4"
                    >
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {usuarios.length > 0 ? (
                  usuarios.map((usuario, index) => ((usuario.usuario_cod !== thisUser?.usuario_cod && usuario.nivelAcesso.nivelAcesso_cod !== 0) ? (
                    <TableRow
                      key={index}
                      className={index % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                    >
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.usuario_nome}</TableCell>
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.usuario_cargo}</TableCell>
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.setor?.setorNome}</TableCell>
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.usuario_cargaHoraria}</TableCell>
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.usuarioTipoContratacao}</TableCell>
                      <TableCell className="border border-gray-200 text-center text-black text-base p-3">{usuario.nivelAcesso?.nivelAcesso_nome}</TableCell>
                      <TableCell className="border-r border-gray-300 text-left justify-center flex">
                        <button
                          onClick={() => handleViewUser(usuario.usuario_cod)}
                          className="bg-[#FFB503] rounded-md p-2 hover:bg-orange-600">
                          <FontAwesomeIcon icon={faEye} className="text-black-600" />
                        </button>
                      </TableCell>

                    </TableRow>
                  ) : null))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">Nenhum colaborador encontrado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Mobile - Tabela deitada com mesmo estilo */}
          <div className="block md:hidden overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-sm text-black">
              <tbody>
                {[
                  { label: "NOME", render: (usuario: UsuarioInfo) => usuario.usuario_nome },
                  { label: "CARGO", render: (usuario: UsuarioInfo) => usuario.usuario_cargo },
                  { label: "SETOR", render: (usuario: UsuarioInfo) => usuario.setor?.setorNome },
                  { label: "CARGA HORÁRIA DIÁRIA", render: (usuario: UsuarioInfo) => usuario.usuario_cargaHoraria },
                  { label: "CONTRATO", render: (usuario: UsuarioInfo) => usuario.usuarioTipoContratacao },
                  { label: "NÍVEL ACESSO", render: (usuario: UsuarioInfo) => usuario.nivelAcesso?.nivelAcesso_nome },
                  {
                    label: "AÇÕES", render: (usuario: UsuarioInfo) => (<button onClick={() => handleViewUser(usuario.usuario_cod)}
                      className="bg-[#FFB503] rounded-md p-2 hover:bg-orange-600">
                      <FontAwesomeIcon icon={faEye} className="text-black-600" />
                    </button>)
                  }
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-200 p-3 font-semibold">{row.label}</td>
                    {usuarios.length > 0 ? (
                      usuarios.map((usuario, i) => ((usuario.usuario_cod !== thisUser?.usuario_cod && usuario.nivelAcesso.nivelAcesso_cod !== 0) ? (
                        <td
                          key={i}
                          className={`border border-gray-200 p-3 text-center text-base ${i % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                          `}
                        >
                          {row.render(usuario)}
                        </td>
                      ) : null))
                    ) : (
                      <td colSpan={6} className="text-center">Nenhum colaborador encontrado</td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
