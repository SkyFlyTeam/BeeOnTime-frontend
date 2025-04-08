import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";

import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UsuarioInfo from "@/interfaces/usuarioInfo";
import { usuarioServices } from "@/services/usuarioService";

import styles from '@/styles/Colaboradores.module.css'
import CadastroUsuario from "@/components/CadastroUsuario";
import { useRouter } from 'next/router';
import { getUsuario } from "@/services/authService";

export default function Colaboradores() {
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [thisUser, setThisUser] = useState<UsuarioInfo>();
  
  const [isOpen, setIsOpen] = useState(false); 
  const [currentPage, setCurrentPage] = useState(1); // Página atual
  const itemsPerPage = 5; // Itens por página

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

  const getUser = async() => {
    const user = await getUsuario();
    console.log (user);
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

  // Função para mudar a página
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Função para navegar para a página anterior
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Função para navegar para a página seguinte
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Calcular os itens da página atual
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = usuarios.slice(startIndex, endIndex);

  // Total de páginas
  const totalPages = Math.ceil(usuarios.length / itemsPerPage);

  if (loading) {
    return <div>Carregando...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <div className="container mx-auto px-4 flex justify-between mb-4">
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

      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
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
                {currentItems.length > 0 ? (
                  currentItems.map((usuario, index) => (
                    (usuario.usuario_cod !== thisUser?.usuario_cod && usuario.nivelAcesso.nivelAcesso_cod !== 0) ? (
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
                        <TableCell className="border-r border-b border-gray-200 text-center justify-center flex">
                          <button 
                            onClick={() => handleViewUser(usuario.usuario_cod)} 
                            className="bg-[#FFB503] rounded-md p-2 hover:bg-orange-600">
                            <FontAwesomeIcon icon={faEye} className="text-black-600"/>
                          </button>
                        </TableCell>
                      </TableRow>
                    ) : null
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center">Nenhum colaborador encontrado</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginação */}
          <div className="flex justify-end mt-4">
            <button 
              className="px-4 py-2 rounded-md text-gray mr-2"
              onClick={handlePreviousPage}
              disabled={currentPage === 1}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>

            {/* Números das páginas */}
            {[...Array(totalPages)].map((_, idx) => (
              <button 
                key={idx + 1}
                className={`px-4 py-2 rounded-md ${currentPage === idx + 1 ? "text-gray" : "bg-white text-black"} hover:bg-[#FFB503]`}
                onClick={() => handlePageChange(idx + 1)}
              >
                {idx + 1}
              </button>
            ))}

            <button 
              className="px-4 py-2 rounded-md text-gray ml-2"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <CadastroUsuario onClose={() => setIsOpen(false)} onSave={showToast} />
      )}

      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
