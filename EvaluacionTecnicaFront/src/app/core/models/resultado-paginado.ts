export interface ResultadoPaginado<T> {
  pagina: number;
  tamanoPagina: number;
  totalRegistros: number;
  totalPaginas: number;
  datos: T[];
}
