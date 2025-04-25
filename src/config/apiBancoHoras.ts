import axios from "axios";

// Retorna uma instância do Axios
export const ApiBancoHoras = axios.create({
  baseURL: 'http://localhost:8084'
});