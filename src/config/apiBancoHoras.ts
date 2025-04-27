import axios from "axios";

// Retorna uma instância do Axios
export const ApiBancoHoras = axios.create({
  baseURL: 'http://localhost:8084',

  validateStatus: function (status) {
    // Aceita status entre 200 e 302 como válidos
    return status >= 200 && status <= 302;
}
});