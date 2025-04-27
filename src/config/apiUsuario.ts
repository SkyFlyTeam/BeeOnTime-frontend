import axios from "axios";

// Retorna uma instância do Axios
export const ApiUsuario = axios.create({
  baseURL: 'http://localhost:8081',
  headers: {
    "Content-Type": "multipart/form-data",
  },
});