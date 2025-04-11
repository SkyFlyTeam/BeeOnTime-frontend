import axios from 'axios';
import { AccessPass } from '../lib/server/auth';
import { attemptLoginSession } from '../lib/server/auth/login';
import { TextDecoderStream } from 'stream/web';
import { Api } from '@/config/apiConfig';

// Função para login
export async function setLogIn(creds: AccessPass): Promise<any> {
  try {
    const res = await axios.post(`/auth/login`, JSON.stringify(creds), {
      headers: { "Content-Type": "application/json" },
    });
    // alert("setLogIn " + res.data + " " + res.status);
    return res;
  } catch (error) {
    // Aqui, o erro pode ser tipado como um AxiosError para melhor manipulação
    const res = (error as any).response as any; // ou use AxiosError
    // alert("setLogIn " + res.data + " " + res.status);
    return res;
  }
}

// Função para obter o ID do papel (role)
export async function getRoleID(): Promise<any> {
  try {
    const res = await axios.get("/auth/user/role");
    return res;
  } catch (error) {
    const res = (error as any).response as any;
    return res;
  }
}

// Função para obter dados do usuário
export async function getUsuario(): Promise<any> {
  try {
    const res = await axios.get("/auth/user");
    return res;
  } catch (error) {
    const res = (error as any).response as any;
    return res;
  }
}