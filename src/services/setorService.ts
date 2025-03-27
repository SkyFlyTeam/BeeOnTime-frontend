// src/services/usuarioService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8080';

export const cadastrarSetor = async (setoresData: string[]) => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(setoresData, null, 2));

    // Array para armazenar as promessas de cada requisição
    const requests = setoresData.map(async (setor) => {
      const response = await axios.post(
        `${API_URL}/setor`, // Ajuste o endpoint conforme necessário
        { setorNome: setor }, // Envia cada setor como um objeto JSON
        {
          headers: { "Content-Type": "application/json" },
        }
      );
      console.log(`✅ Resposta do backend para "${setor}":`, response.data);
      return response.status;
    });

    // Aguarda todas as requisições serem concluídas
    const statuses = await Promise.all(requests);
    return statuses; // Retorna um array com os status de cada requisição

  } catch (error: any) {
    if (error.response) {
      console.error("❌ Erro no backend:", error.response.data);
    } else {
      console.error("❌ Erro na requisição:", error.message);
    }
    throw error;
  }
};