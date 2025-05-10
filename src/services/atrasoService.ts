import Atraso from "@/interfaces/atraso";
import { ApiPonto } from "../config/apiPonto";

const getPontos = async (): Promise<Atraso[]> => {
    const { data } = await ApiPonto.get(`/atraso/atrasos`)
    return data as Atraso[]
}

const getPontosBySetor = async (setorCod: number): Promise<Atraso[]> => {
    const { data } = await ApiPonto.get(`/atrasos/setor/${setorCod}`)
    return data as Atraso[]
}

export const atrasoServices = {
    getPontos,
    getPontosBySetor
}