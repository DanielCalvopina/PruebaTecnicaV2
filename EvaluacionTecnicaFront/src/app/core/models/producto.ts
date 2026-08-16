export interface Producto {
  id: string;
  nombre: string;
  descripcion?: string | null;
  categoria: string;
  imagen?: string | null;
  precio: number;
  stock: number;
  activo: boolean;
  fechaCreacion: string;
  fechaActualizacion?: string | null;
}

export interface CrearProducto {
  nombre: string;
  descripcion?: string | null;
  categoria: string;
  imagen?: string | null;
  precio: number;
  stock: number;
}

export interface ActualizarProducto {
  nombre: string;
  descripcion?: string | null;
  categoria: string;
  imagen?: string | null;
  precio: number;
}

export interface FiltrosProductos {
  pagina: number;
  tamanoPagina: number;
  nombre?: string | null;
  categoria?: string | null;
  precioMinimo?: number | null;
  precioMaximo?: number | null;
  stockMinimo?: number | null;
  stockMaximo?: number | null;
}
