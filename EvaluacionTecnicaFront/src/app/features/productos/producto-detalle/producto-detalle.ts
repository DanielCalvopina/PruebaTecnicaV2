import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Producto } from '../../../core/models/producto';
import { TipoTransaccion, Transaccion } from '../../../core/models/transaccion';
import { ProductosService } from '../../../core/services/productos';
import { TransaccionesService } from '../../../core/services/transacciones';

interface ProductoDetalleData {
  id: string;
}

@Component({
  selector: 'app-producto-detalle',
  imports: [CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatTableModule],
  template: `
    <h2 mat-dialog-title>Detalle de producto</h2>

    @if (producto) {
      <mat-dialog-content class="detail-dialog-content">
        <section class="product-detail-summary">
          @if (producto.imagen) { <img class="product-hero-image" [src]="producto.imagen" alt="Imagen de {{ producto.nombre }}" /> }
          <div>
            <h3>{{ producto.nombre }}</h3>
            <p>{{ producto.descripcion || 'Sin descripcion' }}</p>
            <p><strong>Categoria:</strong> {{ producto.categoria }}</p>
            <p><strong>Precio:</strong> {{ producto.precio | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</p>
            <p><strong>Stock:</strong> {{ producto.stock }}</p>
          </div>
        </section>

        <form class="filters" (ngSubmit)="buscarHistorial()">
          <mat-form-field appearance="outline">
            <mat-label>Tipo</mat-label>
            <mat-select [(ngModel)]="tipo" name="tipo">
              <mat-option value="">Todos</mat-option>
              <mat-option value="Compra">Compra</mat-option>
              <mat-option value="Venta">Venta</mat-option>
            </mat-select>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha desde</mat-label>
            <input matInput [matDatepicker]="fechaDesdePicker" [(ngModel)]="fechaDesde" name="fechaDesde" />
            <mat-datepicker-toggle matIconSuffix [for]="fechaDesdePicker"></mat-datepicker-toggle>
            <mat-datepicker #fechaDesdePicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Fecha hasta</mat-label>
            <input matInput [matDatepicker]="fechaHastaPicker" [(ngModel)]="fechaHasta" name="fechaHasta" />
            <mat-datepicker-toggle matIconSuffix [for]="fechaHastaPicker"></mat-datepicker-toggle>
            <mat-datepicker #fechaHastaPicker></mat-datepicker>
          </mat-form-field>
          <div class="toolbar-actions">
            <button mat-flat-button type="submit"><mat-icon>search</mat-icon>Buscar</button>
            <button mat-button type="button" (click)="limpiarFiltros()">Limpiar</button>
          </div>
        </form>
        <div class="table-wrap">
          <table mat-table [dataSource]="transacciones" class="data-table">
            <ng-container matColumnDef="fecha"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let t">{{ t.fecha | date: 'short' }}</td></ng-container>
            <ng-container matColumnDef="tipo"><th mat-header-cell *matHeaderCellDef>Tipo</th><td mat-cell *matCellDef="let t">{{ t.tipo }}</td></ng-container>
            <ng-container matColumnDef="cantidad"><th mat-header-cell *matHeaderCellDef>Cantidad</th><td mat-cell *matCellDef="let t">{{ t.cantidad }}</td></ng-container>
            <ng-container matColumnDef="precioUnitario"><th mat-header-cell *matHeaderCellDef>Precio unitario</th><td mat-cell *matCellDef="let t">{{ t.precioUnitario | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td></ng-container>
            <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef>Total</th><td mat-cell *matCellDef="let t">{{ t.precioTotal | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td></ng-container>
            <ng-container matColumnDef="detalle"><th mat-header-cell *matHeaderCellDef>Detalle</th><td mat-cell *matCellDef="let t">{{ t.detalle || 'Sin detalle' }}</td></ng-container>
            <tr mat-header-row *matHeaderRowDef="columnas"></tr><tr mat-row *matRowDef="let row; columns: columnas"></tr>
          </table>
        </div>
        @if (transacciones.length === 0) { <div class="empty-state">No hay transacciones para este producto.</div> }
      </mat-dialog-content>
    }

    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close type="button">Cerrar</button>
    </mat-dialog-actions>
  `
})
export class ProductoDetalle implements OnInit {
  private readonly data = inject<ProductoDetalleData>(MAT_DIALOG_DATA);
  private readonly productosService = inject(ProductosService);
  private readonly transaccionesService = inject(TransaccionesService);
  producto: Producto | null = null;
  transacciones: Transaccion[] = [];
  columnas = ['fecha', 'tipo', 'cantidad', 'precioUnitario', 'total', 'detalle'];
  productoId = '';
  tipo: TipoTransaccion | '' = '';
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  ngOnInit(): void {
    const id = this.data.id;
    if (!id) return;
    this.productoId = id;
    this.productosService.obtener(id).subscribe((p) => this.producto = p);
    this.cargarHistorial();
  }

  buscarHistorial(): void {
    this.cargarHistorial();
  }

  limpiarFiltros(): void {
    this.tipo = '';
    this.fechaDesde = null;
    this.fechaHasta = null;
    this.cargarHistorial();
  }

  private cargarHistorial(): void {
    this.transaccionesService.listar({
      pagina: 1,
      tamanoPagina: 50,
      productoId: this.productoId,
      tipo: this.tipo || null,
      fechaDesde: this.normalizarFechaInicio(this.fechaDesde),
      fechaHasta: this.normalizarFechaFin(this.fechaHasta)
    }).subscribe((r) => this.transacciones = r.datos);
  }

  private normalizarFechaInicio(valor: Date | null): string | null {
    if (!valor) return null;

    const fecha = new Date(valor);
    fecha.setHours(0, 0, 0, 0);
    return fecha.toISOString();
  }

  private normalizarFechaFin(valor: Date | null): string | null {
    if (!valor) return null;

    const fecha = new Date(valor);
    fecha.setHours(23, 59, 59, 999);
    return fecha.toISOString();
  }
}
