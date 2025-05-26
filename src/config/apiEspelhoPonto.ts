import axios from "axios";

// Retorna uma instância do Axios
export const ApiEspelhoPonto = axios.create({
  baseURL: 'http://localhost:8085'
});