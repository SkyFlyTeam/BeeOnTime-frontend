export const slugify = (str: string) => {
  /*
    Transforma uma string no padrão de snake case retirando caracteres especiais 
    -> Ex: 'São jose dos campos" - sao_jose_dos_campos
  */
  return str
    // 1. Decompõe acentos: transforma 'ã' em 'a' + '~', etc.
    .normalize('NFD')
    // 2. Remove os “combining diacritical marks”
    .replace(/[\u0300-\u036f]/g, '')
    // 3. Converte tudo pra minúsculas
    .toLowerCase()
    // 4. Remove tudo que não for letra, número ou espaço (opcional)
    .replace(/[^\w\s]/g, '')
    // 5. Substitui espaços (um ou mais) por underscore
    .replace(/\s+/g, '_')
    // 6. Remove underscores sobrando no começo/fim (opcional)
    .replace(/^_+|_+$/g, '');
}
