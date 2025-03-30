// pages/cadastro.tsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import CadastroForm from "@/components/CadastroUsuario"; // Atualize o caminho conforme necessário
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import UsuarioInfo from "@/interfaces/usuarioInfo";
import { usuarioServices } from "@/services/usuarioService";

import styles from './Colaboradores.module.css'

export default function Colaboradores() {
  const [usuarios, setUsuarios] = useState<UsuarioInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false); 

  const fetchUsuarios = async () => {
    try {
      const data = await usuarioServices.getAllUsuarios() as UsuarioInfo[];
      setUsuarios(data);
    } catch (err) {
      setError("Erro ao carregar os usuários.");
    } finally {
      setLoading(false);
    }
  };

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
  };

  // if (loading) {
  //   return <div>Carregando...</div>;
  // }

  // if (error) {
  //   return <div>{error}</div>;
  // }


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

      {/* Modal Controle */}
      {/* {isOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50"> 
          <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
            <button 
              onClick={() => setIsOpen(false)} 
              className="text-xl absolute top-2 right-2">
              X
            </button>
            <CadastroForm onClose={() => setIsOpen(false)} />
          </div>
        </div>
      )} */}

      {isOpen && (
        <CadastroForm onClose={() => setIsOpen(false)} onSave={showToast}/>
      )}


      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <div className="overflow-x-auto">
          {/* Desktop - Tabela horizontal */}
          <div className="hidden md:block">
            <Table className="min-w-[900px] w-full">
              <TableHeader>
                <TableRow>
                  {["NOME", "CARGO", "SETOR", "CARGA HORÁRIA DIÁRIA", "CONTRATO", "NÍVEL ACESSO"].map((header, idx) => (
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
                {usuarios.map((usuario, index) => (
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
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile - Tabela deitada com mesmo estilo */}
          <div className="block md:hidden overflow-x-auto">
            <table className="min-w-[900px] w-full border-collapse text-sm text-black">
              <tbody>
                {[
                  { 
                    label: "NOME",
                    render: (usuario: UsuarioInfo) => usuario.usuario_nome,
                  },
                  { 
                    label: "CARGO", 
                    render: (usuario: UsuarioInfo) => usuario.usuario_cargo,
                  },
                  {
                    label: "SETOR", 
                    render: (usuario: UsuarioInfo) => usuario.setor?.setorNome,
                  },
                  { 
                    label: "CARGA HORÁRIA DIÁRIA", 
                    render: (usuario: UsuarioInfo) => usuario.usuario_cargaHoraria,
                  },
                  { 
                    label: "CONTRATO",   
                    render: (usuario: UsuarioInfo) => usuario.usuarioTipoContratacao, 
                  },
                  {
                    label: "NÍVEL ACESSO",
                    render: (usuario: UsuarioInfo) => usuario.nivelAcesso?.nivelAcesso_nome, // Função render para campos aninhados
                  },
                ].map((row, idx) => (
                  <tr key={idx}>
                    <td className="border border-gray-200 p-3 font-semibold">{row.label}</td>
                    {usuarios.map((usuario, i) => (
                      <td
                        key={i}
                        className={`border border-gray-200 p-3 text-center text-base ${i % 2 === 0 ? "bg-[#FFF8E1]" : "bg-[#FFFFFF]"}
                        `}
                      >
                        {/* Renderiza campos aninhados caso haja uma função render */}
                        {row.render(usuario)}
                      </td>
                    ))}
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
