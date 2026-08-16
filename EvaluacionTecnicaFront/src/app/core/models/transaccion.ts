export type TipoTransaccion = 'Compra' | 'Venta';

export interface Transaccion {
  id: string;
  fecha: string;
  tipo: TipoTransaccion;
  productoId: string;
  nombreProducto?: string | null;
  stockProducto?: number | null;
  cantidad: number;
  precioUnitario: number;
  precioTotal: number;
  detalle?: string | null;
}

export interface CrearTransaccion {
  fecha?: string | null;
  tipo: TipoTransaccion;
  productoId: string;
  cantidad: number;
  precioUnitario: number;
  detalle?: string | null;
}

export type ActualizarTransaccion = CrearTransaccion;

export interface FiltrosTransacciones {
  pagina: number;
  tamanoPagina: number;
  productoId?: string | null;
  tipo?: TipoTransaccion | null;
  fechaDesde?: string | null;
  fechaHasta?: string | null;
}
