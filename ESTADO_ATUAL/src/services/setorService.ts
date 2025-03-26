// src/services/setorService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8081';

// Função para obter todos os sotores
export const getSetor = async () => {
  try {
    const response = await axios.get(`${API_URL}/setores`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    throw error;
  }
};


