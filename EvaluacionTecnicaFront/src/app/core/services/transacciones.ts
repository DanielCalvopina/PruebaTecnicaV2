import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ResultadoPaginado } from '../models/resultado-paginado';
import { ActualizarTransaccion, CrearTransaccion, FiltrosTransacciones, Transaccion } from '../models/transaccion';
import { construirParametros } from './http-params';

@Injectable({ providedIn: 'root' })
export class TransaccionesService {
  private readonly baseUrl = '/transacciones-api/api/transacciones';

  constructor(private readonly http: HttpClient) {}

  listar(filtros: FiltrosTransacciones): Observable<ResultadoPaginado<Transaccion>> {
    return this.http.get<ResultadoPaginado<Transaccion>>(this.baseUrl, { params: construirParametros(filtros) });
  }

  obtener(id: string): Observable<Transaccion> {
    return this.http.get<Transaccion>(`${this.baseUrl}/${id}`);
  }

  crear(transaccion: CrearTransaccion): Observable<Transaccion> {
    return this.http.post<Transaccion>(this.baseUrl, transaccion);
  }

  actualizar(id: string, transaccion: ActualizarTransaccion): Observable<Transaccion> {
    return this.http.put<Transaccion>(`${this.baseUrl}/${id}`, transaccion);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
