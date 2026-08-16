import { HttpParams } from '@angular/common/http';

export function construirParametros(filtros: object): HttpParams {
  let params = new HttpParams();

  Object.entries(filtros).forEach(([clave, valor]) => {
    if (valor !== null && valor !== undefined && valor !== '') {
      params = params.set(clave, String(valor));
    }
  });

  return params;
}
