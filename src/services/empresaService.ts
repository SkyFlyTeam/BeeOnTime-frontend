// src/services/usuarioService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8081';

interface Empresa {
  emp_nome: string;
  emp_razaoSocial: string;
  emp_CNPJ: string;
  emp_CEP: string;
}

interface EmpresaAPI {
  empCod: number;
  empNome: string;
  empCnpj: string;
  empRazaoSocial: string;
  empCep: string;
  empCidade: string;
  empEstado: string;
  empEndereco: string;
}

export const verificarEmpresa = async (): Promise<EmpresaAPI[]> => {
  try {
    const response = await axios.get(`${API_URL}/empresa`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data; // Return the data (assumed to be of type Empresa)
  } catch (error) {
    console.log("Erro: ", error);
    throw error; // Re-throw the error for the caller to handle
  }
};

// Função para cadastrar empresas
export const cadastrarEmpresa = async (formData: any) => {
  try {

    console.log("📤 Dados sendo enviados:", JSON.stringify(formData, null, 2));

    const response = await axios.post(`${API_URL}/empresa`, formData, {
      headers: { "Content-Type": "application/json" },
    });

    console.log("✅ Resposta do backend:", response.data);

    return response.data.empCod;
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Erro no backend:", error.response.data);
    } else {
      console.error("❌ Erro na requisição:", error.message);
    }
    throw error;
  }
};

export const atualizarEmpresa = async (empresaData: EmpresaAPI) => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(empresaData, null, 2));
    const response = await axios.put(
      `${API_URL}/empresa/${empresaData.empCod}`, // Assuming endpoint uses empCod
      empresaData,
      {
        headers: { "Content-Type": "application/json" },
      }
    );
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