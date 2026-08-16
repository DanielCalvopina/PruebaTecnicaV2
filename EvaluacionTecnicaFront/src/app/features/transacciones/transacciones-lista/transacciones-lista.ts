import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { Producto } from '../../../core/models/producto';
import { TipoTransaccion, Transaccion } from '../../../core/models/transaccion';
import { Notificaciones } from '../../../core/services/notificaciones';
import { ProductosService } from '../../../core/services/productos';
import { TransaccionesService } from '../../../core/services/transacciones';
import { ConfirmacionDialog } from '../../../shared/confirmacion-dialog/confirmacion-dialog';
import { TransaccionDetalleDialog } from '../../../shared/transaccion-detalle-dialog/transaccion-detalle-dialog';
import { TransaccionFormulario } from '../transaccion-formulario/transaccion-formulario';

@Component({
  selector: 'app-transacciones-lista',
  imports: [CurrencyPipe, DatePipe, FormsModule, MatButtonModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatPaginatorModule, MatProgressBarModule, MatSelectModule, MatTableModule],
  template: `
    <section class="page-header">
      <div><h1 class="page-title">Transacciones</h1><p class="page-subtitle">Compras, ventas e historial.</p></div>
      <button mat-flat-button type="button" (click)="crear()"><mat-icon>add</mat-icon>Nueva transaccion</button>
    </section>
    <section class="panel">
      <form class="filters" (ngSubmit)="buscar()">
        <mat-form-field appearance="outline"><mat-label>Producto</mat-label><mat-select [(ngModel)]="productoId" name="productoId"><mat-option value="">Todos</mat-option>@for (p of productos; track p.id) { <mat-option [value]="p.id">{{ p.nombre }}</mat-option> }</mat-select></mat-form-field>
        <mat-form-field appearance="outline"><mat-label>Tipo</mat-label><mat-select [(ngModel)]="tipo" name="tipo"><mat-option value="">Todos</mat-option><mat-option value="Compra">Compra</mat-option><mat-option value="Venta">Venta</mat-option></mat-select></mat-form-field>
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
        <div class="toolbar-actions"><button mat-flat-button type="submit"><mat-icon>search</mat-icon>Buscar</button><button mat-button type="button" (click)="limpiar()">Limpiar</button></div>
      </form>
      @if (cargando) { <mat-progress-bar mode="indeterminate" /> }
      <div class="table-wrap">
        <table mat-table [dataSource]="transacciones" class="data-table">
          <ng-container matColumnDef="fecha"><th mat-header-cell *matHeaderCellDef>Fecha</th><td mat-cell *matCellDef="let t">{{ t.fecha | date: 'short' }}</td></ng-container>
          <ng-container matColumnDef="tipo"><th mat-header-cell *matHeaderCellDef>Tipo</th><td mat-cell *matCellDef="let t"><span class="status-chip" [class.purchase]="t.tipo === 'Compra'" [class.sale]="t.tipo === 'Venta'">{{ t.tipo }}</span></td></ng-container>
          <ng-container matColumnDef="producto"><th mat-header-cell *matHeaderCellDef>Producto</th><td mat-cell *matCellDef="let t">{{ t.nombreProducto || t.productoId }}</td></ng-container>
          <ng-container matColumnDef="cantidad"><th mat-header-cell *matHeaderCellDef class="numeric">Cantidad</th><td mat-cell *matCellDef="let t" class="numeric">{{ t.cantidad }}</td></ng-container>
          <ng-container matColumnDef="precioUnitario"><th mat-header-cell *matHeaderCellDef class="numeric">Precio unitario</th><td mat-cell *matCellDef="let t" class="numeric">{{ t.precioUnitario | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td></ng-container>
          <ng-container matColumnDef="total"><th mat-header-cell *matHeaderCellDef class="numeric">Total</th><td mat-cell *matCellDef="let t" class="numeric">{{ t.precioTotal | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</td></ng-container>
          <ng-container matColumnDef="detalle"><th mat-header-cell *matHeaderCellDef>Detalle</th><td mat-cell *matCellDef="let t">@if (t.detalle) { <button mat-button type="button" (click)="verDetalle(t)">Ver</button> } @else { <span>Sin detalle</span> }</td></ng-container>
          <ng-container matColumnDef="acciones"><th mat-header-cell *matHeaderCellDef>Acciones</th><td mat-cell *matCellDef="let t"><button mat-icon-button type="button" (click)="editar(t)"><mat-icon>edit</mat-icon></button><button mat-icon-button type="button" (click)="eliminar(t)"><mat-icon>delete</mat-icon></button></td></ng-container>
          <tr mat-header-row *matHeaderRowDef="columnas"></tr><tr mat-row *matRowDef="let row; columns: columnas"></tr>
        </table>
      </div>
      @if (!cargando && transacciones.length === 0) { <div class="empty-state">No hay transacciones para mostrar.</div> }
      <mat-paginator [length]="totalRegistros" [pageIndex]="pagina - 1" [pageSize]="tamanoPagina" [pageSizeOptions]="[5, 10, 25, 50]" (page)="cambiarPagina($event)" />
    </section>
  `
})
export class TransaccionesLista implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly notificaciones = inject(Notificaciones);
  private readonly dialog = inject(MatDialog);
  columnas = ['fecha', 'tipo', 'producto', 'cantidad', 'precioUnitario', 'total', 'detalle', 'acciones'];
  productos: Producto[] = [];
  transacciones: Transaccion[] = [];
  totalRegistros = 0;
  pagina = 1;
  tamanoPagina = 10;
  cargando = false;
  productoId = '';
  tipo: TipoTransaccion | '' = '';
  fechaDesde: Date | null = null;
  fechaHasta: Date | null = null;

  ngOnInit(): void {
    this.cargarProductos();
    this.listar();
  }

  cargarProductos(): void {
    this.productosService.listar({ pagina: 1, tamanoPagina: 100 }).subscribe((r) => this.productos = r.datos);
  }

  listar(): void {
    this.cargando = true;
    this.transaccionesService.listar({
      pagina: this.pagina,
      tamanoPagina: this.tamanoPagina,
      productoId: this.productoId || null,
      tipo: this.tipo || null,
      fechaDesde: this.normalizarFechaInicio(this.fechaDesde),
      fechaHasta: this.normalizarFechaFin(this.fechaHasta)
    }).subscribe({
      next: (r) => { this.transacciones = r.datos; this.totalRegistros = r.totalRegistros; this.cargando = false; },
      error: (e) => { this.cargando = false; this.notificaciones.error(e, 'No fue posible cargar las transacciones.'); }
    });
  }

  buscar(): void { this.pagina = 1; this.listar(); }
  limpiar(): void { this.productoId = ''; this.tipo = ''; this.fechaDesde = null; this.fechaHasta = null; this.buscar(); }
  cambiarPagina(e: PageEvent): void { this.pagina = e.pageIndex + 1; this.tamanoPagina = e.pageSize; this.listar(); }

  crear(): void {
    this.abrirFormulario();
  }

  editar(transaccion: Transaccion): void {
    this.abrirFormulario(transaccion.id);
  }

  verDetalle(transaccion: Transaccion): void {
    this.dialog.open(TransaccionDetalleDialog, {
      width: '620px',
      maxWidth: '94vw',
      data: transaccion
    });
  }

  eliminar(t: Transaccion): void {
    this.dialog.open(ConfirmacionDialog, {
      width: '420px',
      maxWidth: '94vw',
      panelClass: 'confirm-dialog-panel',
      data: {
        titulo: 'Eliminar transaccion',
        mensaje: `Se eliminara la transaccion de tipo "${t.tipo}" por ${t.cantidad} unidad(es).`,
        textoConfirmar: 'Eliminar'
      }
    }).afterClosed().subscribe((confirmado) => {
      if (!confirmado) return;

      this.transaccionesService.eliminar(t.id).subscribe({
        next: () => { this.notificaciones.exito('Transaccion eliminada.'); this.cargarProductos(); this.listar(); },
        error: (e) => this.notificaciones.error(e, 'No fue posible eliminar la transaccion.')
      });
    });
  }

  private abrirFormulario(id?: string): void {
    this.dialog.open(TransaccionFormulario, {
      width: '760px',
      maxWidth: '96vw',
      data: { id: id ?? null }
    }).afterClosed().subscribe((guardado) => {
      if (!guardado) return;
      this.cargarProductos();
      this.listar();
    });
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
