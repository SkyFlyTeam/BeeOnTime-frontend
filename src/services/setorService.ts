// src/services/usuarioService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8080';

interface Setor {
  setor_cod: number;
  setor_nome: string;
}

interface SetorAPI {
  setorCod: number;
  setorNome: string;
}

export const verificarSetores = async (): Promise<SetorAPI[]> => {
  try {
    const response = await axios.get(`${API_URL}/setor`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data
  }
  catch(error) {
    console.log(error)
    throw error
  }
} 

export const cadastrarSetor = async (setoresData: string[]) => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(setoresData, null, 2));
    const requests = setoresData.map(async (setor) => {
      const response = await axios.post(
        `${API_URL}/setor`,
        { setorNome: setor },
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(`✅ Resposta do backend para "${setor}":`, response.data);
      return { setorCod: response.data.setorCod, setorNome: response.data.setorNome }; // Ajuste conforme o retorno
    });
    const setoresCriados = await Promise.all(requests);
    return setoresCriados; // Retorna array de { setorCod, setorNome }
  } catch (error: any) {
    if (error.response) {
      console.error("❌ Erro no backend:", error.response.data);
    } else {
      console.error("❌ Erro na requisição:", error.message);
    }
    throw error;
  }
};

export const atualizarSetor = async (setorData: Setor) => {
  try {
    console.log("📤 Dados sendo enviados:", JSON.stringify(setorData, null, 2));

    const response = await axios.put(
      `${API_URL}/setor/${setorData.setor_cod}`, // Endpoint includes the sector ID
      { setorNome: setorData.setor_nome }, // Send the updated sector name
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    console.log(`✅ Resposta do backend para setor "${setorData.setor_nome}":`, response.data);
    return response.status; // Return the status code (e.g., 200)

  } catch (error: any) {
    if (error.response) {
      console.error("❌ Erro no backend:", error.response.data);
    } else {
      console.error("❌ Erro na requisição:", error.message);
    }
    throw error; // Re-throw the error for the caller to handle
  }
};