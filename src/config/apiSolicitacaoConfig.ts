import axios from "axios";

// Retorna uma instância do Axios
export const ApiSolicitacao = axios.create({
  baseURL: 'http://localhost:8083'
});