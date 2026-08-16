import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Producto } from '../../../core/models/producto';
import { Notificaciones } from '../../../core/services/notificaciones';
import { ProductosService } from '../../../core/services/productos';
import { ConfirmacionDialog } from '../../../shared/confirmacion-dialog/confirmacion-dialog';
import { ProductoDetalle } from '../producto-detalle/producto-detalle';
import { ProductoFormulario } from '../producto-formulario/producto-formulario';

@Component({
  selector: 'app-productos-lista',
  imports: [CurrencyPipe, FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatTableModule],
  template: `
    <section class="page-header">
      <div>
        <h1 class="page-title">Productos</h1>
        <p class="page-subtitle">Listado dinamico con filtros y paginacion.</p>
      </div>
      <button mat-flat-button type="button" (click)="crear()"><mat-icon>add</mat-icon>Nuevo producto</button>
    </section>

    <section class="panel">
      <form class="filters" (ngSubmit)="buscar()">
        <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput [(ngModel)]="nombre" name="nombre" /></mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Categoria</mat-label>
          <mat-select [(ngModel)]="categoria" name="categoria">
            <mat-option value="">Todas</mat-option>
            @for (item of categorias; track item) { <mat-option [value]="item">{{ item }}</mat-option> }
          </mat-select>
        </mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Precio minimo</mat-label><input matInput type="number" [(ngModel)]="precioMinimo" name="precioMinimo" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Precio maximo</mat-label><input matInput type="number" [(ngModel)]="precioMaximo" name="precioMaximo" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock minimo</mat-label><input matInput type="number" [(ngModel)]="stockMinimo" name="stockMinimo" /></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Stock maximo</mat-label><input matInput type="number" [(ngModel)]="stockMaximo" name="stockMaximo" /></mat-form-field>
        <div class="toolbar-actions">
          <button mat-flat-button type="submit"><mat-icon>search</mat-icon>Buscar</button>
          <button mat-button type="button" (click)="limpiar()">Limpiar</button>
        </div>
      </form>

      @if (cargando) { <mat-progress-bar mode="indeterminate" /> }

      <div class="table-wrap">
        <table mat-table [dataSource]="productos" class="data-table">
          <ng-container matColumnDef="nombre"><th mat-header-cell *matHeaderCellDef>Producto</th><td mat-cell *matCellDef="let p">
            <div class="product-cell">
              @if (p.imagen) { <img class="product-thumb" [src]="p.imagen" alt="Imagen de {{ p.nombre }}" /> }
              <div><strong>{{ p.nombre }}</strong><br /><span>{{ p.descripcion || 'Sin descripcion' }}</span></div>
            </div>
          </td></ng-container>
          <ng-container matColumnDef="categoria"><th mat-header-cell *matHeaderCellDef>Categoria</th><td mat-cell *matCellDef="let p">{{ p.categoria }}</td></ng-container>
          <ng-container matColumnDef="precio"><th mat-header-cell *matHeaderCellDef class="numeric">Precio</th><td mat-cell *matCellDef="let p" class="numeric">{{ p.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td></ng-container>
          <ng-container matColumnDef="stock"><th mat-header-cell *matHeaderCellDef class="numeric">Stock</th><td mat-cell *matCellDef="let p" class="numeric">{{ p.stock }}</td></ng-container>
          <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef>Acciones</th><td mat-cell *matCellDef="let p">
            <button mat-icon-button type="button" (click)="verDetalle(p)"><mat-icon>visibility</mat-icon></button>
            <button mat-icon-button type="button" (click)="editar(p)"><mat-icon>edit</mat-icon></button>
            <button mat-icon-button type="button" (click)="eliminar(p)"><mat-icon>delete</mat-icon></button>
          </td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columnas"></tr>
          <tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>
      </div>
      @if (!cargando && productos.length === 0) { <div class="empty-state">No hay productos para mostrar.</div> }
      <mat-paginator [length]="totalRegistros" [pageIndex]="pagina - 1" [pageSize]="tamanoPagina" [pageSizeOptions]="[5, 10, 25, 50]" (page)="cambiarPagina($event)" />
    </section>
  `
})
export class ProductosLista implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly notificaciones = inject(Notificaciones);
  private readonly dialog = inject(MatDialog);

  columnas = ['nombre', 'categoria', 'precio', 'stock', 'acciones'];
  productos: Producto[] = [];
  totalRegistros = 0;
  pagina = 1;
  tamanoPagina = 10;
  cargando = false;
  nombre = '';
  categoria = '';
  categorias: string[] = [];
  precioMinimo: number | null = null;
  precioMaximo: number | null = null;
  stockMinimo: number | null = null;
  stockMaximo: number | null = null;

  ngOnInit(): void {
    this.cargarCategorias();
    this.listar();
  }

  cargarCategorias(): void {
    this.productosService.listarCategorias().subscribe({
      next: (categorias) => this.establecerCategorias(categorias),
      error: () => this.cargarCategoriasDesdeProductos()
    });
  }

  cargarCategoriasDesdeProductos(): void {
    this.productosService.listar({ pagina: 1, tamanoPagina: 100 }).subscribe({
      next: (r) => this.sincronizarCategorias(r.datos)
    });
  }

  listar(): void {
    this.cargando = true;
    this.productosService.listar({
      pagina: this.pagina,
      tamanoPagina: this.tamanoPagina,
      nombre: this.nombre,
      categoria: this.categoria,
      precioMinimo: this.precioMinimo,
      precioMaximo: this.precioMaximo,
      stockMinimo: this.stockMinimo,
      stockMaximo: this.stockMaximo
    }).subscribe({
      next: (r) => { this.productos = r.datos; this.sincronizarCategorias(r.datos); this.totalRegistros = r.totalRegistros; this.cargando = false; },
      error: (e) => { this.cargando = false; this.notificaciones.error(e, 'No fue posible cargar los productos.'); }
    });
  }

  buscar(): void { this.pagina = 1; this.listar(); }

  limpiar(): void {
    this.nombre = '';
    this.categoria = '';
    this.precioMinimo = null;
    this.precioMaximo = null;
    this.stockMinimo = null;
    this.stockMaximo = null;
    this.buscar();
  }

  cambiarPagina(evento: PageEvent): void {
    this.pagina = evento.pageIndex + 1;
    this.tamanoPagina = evento.pageSize;
    this.listar();
  }

  crear(): void {
    this.abrirFormulario();
  }

  editar(producto: Producto): void {
    this.abrirFormulario(producto.id);
  }

  verDetalle(producto: Producto): void {
    this.dialog.open(ProductoDetalle, {
      width: '980px',
      maxWidth: '96vw',
      maxHeight: '92vh',
      data: { id: producto.id }
    });
  }

  eliminar(producto: Producto): void {
    this.dialog.open(ConfirmacionDialog, {
      width: '420px',
      maxWidth: '94vw',
      panelClass: 'confirm-dialog-panel',
      data: {
        titulo: 'Eliminar producto',
        mensaje: `Se eliminara "${producto.nombre}". Esta accion no se puede deshacer.`,
        textoConfirmar: 'Eliminar'
      }
    }).afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      this.productosService.eliminar(producto.id).subscribe({
        next: () => { this.notificaciones.exito('Producto eliminado.'); this.listar(); },
        error: (e) => this.notificaciones.error(e, 'No fue posible eliminar el producto.')
      });
    });
  }

  private abrirFormulario(id?: string): void {
    this.dialog.open(ProductoFormulario, {
      width: '760px',
      maxWidth: '96vw',
      data: { id: id ?? null, categorias: this.categorias }
    }).afterClosed().subscribe((guardado) => {
      if (!guardado) return;
      this.cargarCategorias();
      this.listar();
    });
  }

  private establecerCategorias(categorias: string[]): void {
    this.categorias = [...new Set(categorias.map((categoria) => categoria.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    if (this.categoria && !this.categorias.includes(this.categoria)) {
      this.categoria = '';
    }
  }

  private sincronizarCategorias(productos: Producto[]): void {
    const categorias = [
      ...this.categorias,
      ...productos.map((producto) => producto.categoria)
    ];

    this.establecerCategorias(categorias);
  }
}
