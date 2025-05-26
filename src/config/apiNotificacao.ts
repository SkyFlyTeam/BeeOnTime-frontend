import axios from "axios";

// Retorna uma instância do Axios
export const ApiNotificacao = axios.create({
  baseURL: 'http://localhost:8086'
});