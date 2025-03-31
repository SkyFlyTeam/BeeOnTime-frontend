
import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import UsuarioInfo from "@/interfaces/usuarioInfo";
import Jornada from "@/interfaces/usuarioInfo";

// Função para obter todos os usuários
const getAllUsuarios = async () => {
  try {
    const response = await ApiUsuario.get(`/usuario/usuarios`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
      }
  
      return new ApiException("Erro desconhecido.");
  }
};

// Função para cadastrar usuário + jornada
const cadastrarUsuarioComJornada = async (usuario: any, jornada: any) => {
  try {
    // Combina os dados do usuário com os dados da jornada
    const dadosCombinados = { ...usuario, ...jornada };

    console.log("📤 Dados sendo enviados:", JSON.stringify(dadosCombinados, null, 2));

    // Faz a requisição para o backend
    const response = await ApiUsuario.post(`/usuario/cadastrar`, dadosCombinados, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000, // 5 segundos de timeout para evitar requisições longas
    });

    console.log("✅ Resposta do backend:", response.data);

    return response.data; // Retorna os dados da resposta
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
      }
  
      return new ApiException("Erro desconhecido.");
  }
};

// Função para obter um usuário pelo ID
const obterUsuarioPorId = async (id: number) => {
  try {
    const response = await ApiUsuario.get(`/usuario/${id}`);
    return response.data; // Retorna os dados do usuário
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
      }
  
      return new ApiException("Erro desconhecido.");
  }
};

// Função para atualizar um usuário
const atualizarUsuario = async (usuario: any) => {
  try {
    const response = await ApiUsuario.put(`/usuario/atualizar`, usuario);
    return response.data; // Retorna o status de atualização
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
      }
  
      return new ApiException("Erro desconhecido.");
  }
};

// Função para excluir um usuário
const excluirUsuario = async (id: number) => {
  try {
    const response = await ApiUsuario.request({
      url: `/usuario/excluir`,
      method: 'DELETE',
      data: { usuario_cod: id },
    });
    return response.data; // Retorna o status de exclusão
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
      }
  
      return new ApiException("Erro desconhecido.");
  }
};

export const usuarioServices = {
  getAllUsuarios,
  cadastrarUsuarioComJornada,
  obterUsuarioPorId,
  atualizarUsuario,
  excluirUsuario
}
