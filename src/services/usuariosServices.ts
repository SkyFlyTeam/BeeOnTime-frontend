import { Api } from "../config/apiConfig"
import { ApiException } from "../config/apiException"

export interface Usuario {
  Usuario_id: number
  Usuario_nome: string
  Usuario_email: string
  Usuario_senha: string
  Usuario_dataCriacao: Date
  Cargo_id: number
  Usuario_status: boolean 
}


const checkLogin = async (credenciais: any): Promise<any | ApiException> => {
    try{
        const { data } = await Api().post<any>('/auth', credenciais, {
            headers: { 'Content-Type': 'application/json' }
        });
        return data
    } catch(error: any){
        return new ApiException(error.message || 'Erro ao consultar a API.')
    }
}


const createUsuario = async (usuario: any): Promise<any | ApiException> => {
  try{
      const { data } = await Api().post<any>('/usuario', usuario, {
          headers: { 'Content-Type': 'application/json' }
      });
      const usuario_criado: Usuario = data
      return usuario_criado
  
    } catch (error: any) {
      return new ApiException(error.message || 'Erro ao criar o registro.')
    }
}
  

export const usuarioServices = {
    checkLogin,
    createUsuario
}