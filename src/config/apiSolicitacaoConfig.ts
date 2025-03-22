import axios from "axios";

// Retorna uma instância do Axios
export const Api = axios.create({
  baseURL: 'http://localhost:8080'
});