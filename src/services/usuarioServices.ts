import axios from "axios";
import { ApiUsuario } from "@/config/apiUsuario";
import { ApiException } from "../config/apiExceptions";
import Usuario from "@/interfaces/usuario";
import Jornada from "@/interfaces/usuario";


const checkLogin = async (credenciais: any): Promise<any | ApiException> => {
  try {
    const { data } = await ApiUsuario.post<any>('/auth', credenciais, {
      headers: { 'Content-Type': 'application/json' }
    });
    return data;
  } catch (error: any) {
    return new ApiException(error.message || 'Erro ao consultar a API.');
  }
};

const cadastrarUsuarioComJornada = async (usuario: any, jornada: any) => {
  try {
    const dadosCombinados = { ...usuario, usuario_status: true, ...jornada};
    const response = await ApiUsuario.post(`/usuario/cadastrar`, dadosCombinados, {
      headers: { "Content-Type": "application/json" },
      timeout: 5000,
    });
    console.log("Resposta do backend:", response.data);
    return response.data as Usuario;
  } catch (error: any) {
    if (error.response) {
      console.error("Erro no backend:", error.response.data);
      alert(`Erro no servidor: ${error.response.data.message || 'Tente novamente mais tarde.'}`);
    } else if (error.request) {
      console.error("Sem resposta do servidor:", error.request);
      alert('Erro de rede. Não foi possível se conectar ao servidor.');
    } else {
      console.error("Erro na requisição:", error.message);
      alert('Erro desconhecido, tente novamente.');
    }
    throw error;
  }
};

const getUsuarioById = async (usuario_cod: number) => {
  try {
    const { data } = await ApiUsuario.get(`/usuario/${usuario_cod}`);
    return data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const getAllUsuarios = async () => {
  try {
    const response = await ApiUsuario.get(`/usuario/usuarios`);
    return response.data as Usuario[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const obterUsuarioPorId = async (id: number) => {
  try {
    const response = await ApiUsuario.get(`/usuario/${id}`);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const atualizarUsuario = async (usuario: any) => {
  try {
    const response = await ApiUsuario.put(`/usuario/atualizar`, usuario);
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const excluirUsuario = async (id: number) => {
  try {
    const response = await ApiUsuario.request({
      url: `/usuario/excluir`,
      method: 'DELETE',
      data: { usuario_cod: id },
    });
    return response.data;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

export const usuarioServices = {
  checkLogin,
  cadastrarUsuarioComJornada,
  getUsuarioById,
  getAllUsuarios,
  obterUsuarioPorId,
  atualizarUsuario,
  excluirUsuario
};
  