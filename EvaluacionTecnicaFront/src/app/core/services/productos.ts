import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActualizarProducto, CrearProducto, FiltrosProductos, Producto } from '../models/producto';
import { ResultadoPaginado } from '../models/resultado-paginado';
import { construirParametros } from './http-params';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly baseUrl = '/productos-api/api/productos';

  constructor(private readonly http: HttpClient) {}

  listar(filtros: FiltrosProductos): Observable<ResultadoPaginado<Producto>> {
    return this.http.get<ResultadoPaginado<Producto>>(this.baseUrl, { params: construirParametros(filtros) });
  }

  obtener(id: string): Observable<Producto> {
    return this.http.get<Producto>(`${this.baseUrl}/${id}`);
  }

  listarCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.baseUrl}/categorias`);
  }

  crear(producto: CrearProducto): Observable<Producto> {
    return this.http.post<Producto>(this.baseUrl, producto);
  }

  subirImagen(archivo: File): Observable<{ url: string }> {
    const formData = new FormData();
    formData.append('imagen', archivo);

    return this.http.post<{ url: string }>(`${this.baseUrl}/imagenes`, formData);
  }

  actualizar(id: string, producto: ActualizarProducto): Observable<Producto> {
    return this.http.put<Producto>(`${this.baseUrl}/${id}`, producto);
  }

  eliminar(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
