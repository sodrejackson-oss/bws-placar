// Caminho de um arquivo de public/, relativo à base do site.
export const arquivo = (p) => import.meta.env.BASE_URL + p.replace(/^\//, '');
