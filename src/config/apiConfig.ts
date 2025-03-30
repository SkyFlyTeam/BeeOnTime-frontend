import axios from "axios";

// Retorna uma instância do Axios
export const Api = axios.create({
    baseURL: 'http://localhost:8081',
    headers: {
      'Content-Type': 'application/json',
      // Add any other common headers you need here
    },
  });