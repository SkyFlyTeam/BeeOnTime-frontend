import Horas, { HorasDTO } from "./horas";

export default interface Atraso {
    atrasoCod: number,
    atrasoTempo: number,
    horas: HorasDTO
}