import axios from "axios";

// Retorna uma instância do Axios
export const ApiPonto = axios.create({
  baseURL: 'http://localhost:8082'
});