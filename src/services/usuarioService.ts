// src/services/usuarioService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8080';

// Função para obter todos os usuários
export const getUsuarios = async () => {
  try {
    const response = await axios.get(`${API_URL}/usuarios`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

// Função para cadastrar usuário + jornada
export const cadastrarUsuarioComJornada = async (usuario: any, jornada: any) => {
  try {
    const dadosCombinados = { ...usuario, ...jornada };

    console.log("📤 Dados sendo enviados:", JSON.stringify(dadosCombinados, null, 2));

    const response = await axios.post(`${API_URL}/usuario/cadastrar`, dadosCombinados, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Resposta do backend:", response.data);

    return response.status;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Erro no backend:", error.response.data);
    } else {
      console.error("❌ Erro na requisição:", error.message);
    }
    throw error;
  }
};

// Função para obter um usuário pelo ID
export const obterUsuarioPorId = async (id: number) => {
  try {
    const response = await axios.get(`${API_URL}/usuario/${id}`);
    return response.data; // Retorna os dados do usuário
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    throw error;
  }
};

// Função para atualizar um usuário
export const atualizarUsuario = async (usuario: any) => {
  try {
    const response = await axios.put(`${API_URL}/usuario/atualizar`, usuario);
    return response.data; // Retorna o status de atualização
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

// Função para excluir um usuário
export const excluirUsuario = async (id: number) => {
  try {
    const response = await axios.request({
      url: `${API_URL}/usuario/excluir`,
      method: 'DELETE',
      data: { usuario_cod: id },
    });
    return response.data; // Retorna o status de exclusão
  } catch (error) {
    console.error('Erro ao excluir usuário:', error);
    throw error;
  }
};
