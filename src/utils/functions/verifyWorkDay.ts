import { Usuario } from "@/interfaces/usuario";

/**
 * Verifica se, para um dado usuário e data, aquele dia da semana
 * está marcado como dia de trabalho na sua jornada.
 *
 * @param {{ jornadas?: { jornada_diasSemana?: boolean[] } }} usuario
 *   objeto usuário que deve ter a propriedade `jornadas.jornada_diasSemana`
 * @param {Date|string} data
 *   um Date ou uma string que possa ser passada ao construtor Date
 * @returns {boolean}
 */
export const verifyWorkDay = (usuario: Usuario, data: Date) => {
    const jornada = usuario.jornadas;
    if (
      !jornada ||
      !Array.isArray(jornada.jornada_diasSemana) ||
      jornada.jornada_diasSemana.length < 7
    ) {
      return false;
    }
  
    // garante que temos um Date
    const d = data instanceof Date ? data : new Date(data);

    d.setDate(d.getDate() + 1);
  
    // JS getDay(): 0 = Sunday, 1 = Monday, …, 6 = Saturday
    const indice = d.getDay();
    console.log("dia verificando", d, d.getDay())
  
    // retorna true apenas se a posição existir e for truthy
    return !!jornada.jornada_diasSemana[indice];
  }
  