// src/services/setorService.ts
import axios from 'axios';

// Define a URL base do backend
const API_URL = 'http://localhost:8080';

// Função para obter todos os sotores
export const getSetores = async () => {
  try {
    const response = await axios.get(`${API_URL}/setor`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar setores:', error);
    throw error;
  }
};


