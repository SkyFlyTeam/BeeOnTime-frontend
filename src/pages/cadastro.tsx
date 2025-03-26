// pages/cadastro.tsx
import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye } from "@fortawesome/free-solid-svg-icons";
import CadastroForm from "@/components/CadastroForm"; // Atualize o caminho conforme necessário
import { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption } from "@/components/listagem";
import { getUsuarios } from "@/services/usuarioService"; // Certifique-se de que o caminho esteja correto
import "../styles/style.module.css";
import { toast, ToastContainer } from "react-toastify";

export default function CadastroPage() {
  const [usuarios, setUsuarios] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [isOpen, setIsOpen] = useState(false); // Controle do modal
  const [isDataUpdated, setIsDataUpdated] = useState(false);


  useEffect(() => {
    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios() as any[];
        setUsuarios(data);
      } catch (err) {
        setError("Erro ao carregar os usuários.");
      } finally {
        setLoading(false);
      }
    };

    fetchUsuarios();
  }, []);

  useEffect(() => {
    const showPopup = () => {
      toast.success("Dados salvos com sucesso!", {
        position: "top-center",
      });
    };

    const fetchUsuarios = async () => {
      try {
        const data = await getUsuarios() as any[];
        setUsuarios(data);
        showPopup()
      } catch (err) {
        setError("Erro ao carregar os usuários.");
      } finally {
        setLoading(false);
      }
    };
  
    if (!isOpen) {
      fetchUsuarios();
    }
  }, [isOpen]);

  const handleViewUser = (usuarioId: number) => {
    console.log(`Ver detalhes do usuário com ID: ${usuarioId}`);
  };

  const handleAdicionarUsuario = () => {
    // Após o novo usuário ser adicionado, você pode fechar o modal e forçar a atualização dos dados
    setIsDataUpdated(!isDataUpdated); // Força a recarga da lista de usuários
    setIsOpen(false); // Fecha o modal
  };

  if (loading) {
    return <div>Carregando...</div>;
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
          className="bg-[#FFB503] text-black py-1 px-8 rounded-md hover:bg-orange-500 transition-colors"
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
        <CadastroForm onClose={() => setIsOpen(false)} />
      )}



      <div className="container mx-auto p-4 bg-white rounded-lg shadow-lg">
        <Table className="w-full border-l">
          <TableCaption>Lista de usuários cadastrados</TableCaption>

          <TableHeader className="border-l border-gray-300">
            <TableRow className="border-t border-gray-300">
              <TableHead className="text-xl text-black border-r border-gray-300 font-bold">NOME</TableHead>
              <TableHead className="text-xl text-black border-r border-gray-300 font-semibold">CARGO</TableHead>
              <TableHead className="text-xl text-black border-r border-gray-300 font-bold">CARGA HORÁRIA DIÁRIA</TableHead>
              <TableHead className="text-xl text-black border-r border-gray-300 font-bold">CONTRATO</TableHead>
              <TableHead className="text-xl text-left text-black border-r border-gray-300 font-bold">AÇÕES</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className="border-t border-gray-300">
            {usuarios.map((usuario) => (
              <TableRow key={usuario.usuario_cod} className="border-b border-r border-gray-300">
                <TableCell className="border-r border-gray-300">{usuario.usuario_nome}</TableCell>
                <TableCell className="border-r border-gray-300">{usuario.usuario_cargo}</TableCell>
                <TableCell className="border-r border-gray-300">{usuario.usuario_cargaHoraria}</TableCell>
                <TableCell className="border-r border-gray-300">{usuario.usuarioTipoContratacao}</TableCell>
                <TableCell className="border-r border-gray-300 text-left">
                  <button 
                    onClick={() => handleViewUser(usuario.usuario_cod)} 
                    className="bg-[#FFB503] rounded-md p-2 hover:bg-orange-600">
                    <FontAwesomeIcon icon={faEye} className="text-black-600" /> {/* Ícone de olho */}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>

          <TableFooter>
            <TableRow>
              <TableCell colSpan={7}>
                Total de registros: {usuarios.length}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
      <ToastContainer position="top-center" autoClose={3000} /> {/* Add ToastContainer here */}
    </div>
  );
}
