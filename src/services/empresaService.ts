// src/services/usuarioService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8080';

// Função para cadastrar empresas
export const cadastrarEmpresa = async (formData: any) => {
  try {

    console.log("📤 Dados sendo enviados:", JSON.stringify(formData, null, 2));

    const response = await axios.post(`${API_URL}/empresa`, formData, {
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