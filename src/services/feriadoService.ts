import axios from "axios";
import { ApiException } from "@/config/apiExceptions";
import { ApiUsuario } from "@/config/apiUsuario";
import { Feriado, FeriadoAPIResponse } from "@/interfaces/feriado";

const getAllFeriado = async (): Promise<Feriado[] | ApiException> => {
  try {
    const { data } = await ApiUsuario.get(`/feriado`);
    return data as Feriado[];
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const getAllFeriadoFromAPI = async (estado: string, municipio: string, ano: string): Promise<FeriadoAPIResponse[] | ApiException> => {
  const estaduaisOptions = {
    method: 'GET',
    url: 'https://feriados-brasileiros1.p.rapidapi.com/read_uf',
    params: {
      estado: estado,
      ano: ano
    },
    headers: {
      'x-rapidapi-key': '94f82f9c07msh4680d61bb01fee5p162b60jsn8424c644cb9c',
      'x-rapidapi-host': 'feriados-brasileiros1.p.rapidapi.com'
    }
  };

  const municipaisOptions = {
    method: 'GET',
    url: 'https://feriados-brasileiros1.p.rapidapi.com/read',
    params: {
      cidade: municipio,
      estado: estado,
      ano: ano
    },
    headers: {
      'x-rapidapi-key': '94f82f9c07msh4680d61bb01fee5p162b60jsn8424c644cb9c',
      'x-rapidapi-host': 'feriados-brasileiros1.p.rapidapi.com'
    }
  };

  try {
    const feriadosEstaduaisResponse = await axios.request(estaduaisOptions);
    const feriadosMunicipaisResponse = await axios.request(municipaisOptions);
    console.log('feriadosEstaduais', feriadosEstaduaisResponse)
    console.log('feriadosMunicipais', feriadosMunicipaisResponse)
    const feriadosEstaduais = feriadosEstaduaisResponse.data as FeriadoAPIResponse[];
    const feriadosMunicipais = feriadosMunicipaisResponse.data as FeriadoAPIResponse[];

    return [...feriadosEstaduais, ...feriadosMunicipais]
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const getAllFeriadoByEmpresa = async (empCod: number): Promise<Feriado[]> => {
  try {
    const response = await ApiUsuario.get(`/feriado/empresa/${empCod}`, {
      headers: { "Content-Type": "application/json" },
    });
    return response.data as Feriado[]
  } 
  catch(error) {
    console.log(error)
    throw error
  }
} 

const getFeriadoByCod = async (feriadoCod: number): Promise<Feriado | ApiException> => {
  try {
    const { data } = await ApiUsuario.get(`/feriado/${feriadoCod}`);
    return data as Feriado;
  } catch (error) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao consultar a API.");
    }
    return new ApiException("Erro desconhecido.");
  }
};

const cadastrarFeriados = async (feriados: Feriado[]): Promise<Feriado[] | ApiException> => {
  try {
      const { data } = await ApiUsuario.post('/feriado', feriados, {
        headers: { "Content-Type": "application/json" }
      });
      return data as Feriado[];
  } catch (error: any) {
    if (error instanceof Error) {
      return new ApiException(error.message || "Erro ao cadastrar setor.");
    }
    return new ApiException("Erro desconhecido.");
  }
};



export const feriadoServices = {
  getAllFeriado,
  getAllFeriadoByEmpresa,
  getAllFeriadoFromAPI,
  getFeriadoByCod,
  cadastrarFeriados
}; 