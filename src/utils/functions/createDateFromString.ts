export const createDateFromString = (date: string) => {
    /* Formato de data esperado: YYYY-MM-DD */
    const [anoString, mesString, diaString] = date.split('-');

    // Crie a data no formato "YYYY-MM-DD"
    return new Date(Number(anoString), Number(mesString) - 1, Number(diaString));
}