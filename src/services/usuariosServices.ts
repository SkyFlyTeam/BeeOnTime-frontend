import axios from "axios"
import { Api } from "../config/apiConfig"
import { ApiException } from "../config/apiExceptions"

// Define a URL base do backend
const API_URL = 'http://localhost:8080/usuario';

export interface Usuario {
  Usuario_id: number
  Usuario_nome: string
  Usuario_email: string
  Usuario_senha: string
  Usuario_dataCriacao: Date
  Cargo_id: number
  Usuario_status: boolean 
}


const checkLogin = async (credenciais: any): Promise<any | ApiException> => {
    try{
        const { data } = await Api().post<any>('/auth', credenciais, {
            headers: { 'Content-Type': 'application/json' }
        });
        return data
    } catch(error: any){
        return new ApiException(error.message || 'Erro ao consultar a API.')
    }
}


const createUsuario = async (usuario: any): Promise<any | ApiException> => {
  try{
      const { data } = await Api().post<any>('/usuario', usuario, {
          headers: { 'Content-Type': 'application/json' }
      });
      const usuario_criado: Usuario = data
      return usuario_criado
  
    } catch (error: any) {
      return new ApiException(error.message || 'Erro ao criar o registro.')
    }
}

export const cadastrarUsuarioComJornada = async (usuario: any, jornada: any) => {
    try {
      // Combina os dados do usuário com os dados da jornada
      const dadosCombinados = { ...usuario, ...jornada };
  
      console.log("📤 Dados sendo enviados:", JSON.stringify(dadosCombinados, null, 2));
  
      // Faz a requisição para o backend
      const response = await axios.post(`${API_URL}/cadastrar`, dadosCombinados, {
        headers: { "Content-Type": "application/json" },
        timeout: 5000, // 5 segundos de timeout para evitar requisições longas
      });
  
      console.log("✅ Resposta do backend:", response.data);
  
      return response.data; // Retorna os dados da resposta
    } catch (error: any) {
      if (error.response) {
        // Erro vindo do backend
        console.error("❌ Erro no backend:", error.response.data);
        alert(`Erro no servidor: ${error.response.data.message || 'Tente novamente mais tarde.'}`);
      } else if (error.request) {
        // O pedido foi feito, mas não houve resposta
        console.error("❌ Sem resposta do servidor:", error.request);
        alert('Erro de rede. Não foi possível se conectar ao servidor.');
      } else {
        // Outro tipo de erro, como um erro de configuração
        console.error("❌ Erro na requisição:", error.message);
        alert('Erro desconhecido, tente novamente.');
      }
      throw error;
    }
};

export const usuarioServices = {
    checkLogin,
    createUsuario
}