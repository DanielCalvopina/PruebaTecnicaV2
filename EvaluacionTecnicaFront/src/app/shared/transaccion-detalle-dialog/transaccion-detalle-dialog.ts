import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Transaccion } from '../../core/models/transaccion';

@Component({
  selector: 'app-transaccion-detalle-dialog',
  imports: [CurrencyPipe, DatePipe, MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Detalle de transaccion</h2>
    <mat-dialog-content>
      <div class="transaction-detail">
        <div class="transaction-detail-header">
          <span class="status-chip" [class.purchase]="data.tipo === 'Compra'" [class.sale]="data.tipo === 'Venta'">{{ data.tipo }}</span>
          <strong>{{ data.nombreProducto || data.productoId }}</strong>
        </div>

        <dl class="detail-grid">
          <div><dt>Fecha</dt><dd>{{ data.fecha | date: 'medium' }}</dd></div>
          <div><dt>Producto ID</dt><dd>{{ data.productoId }}</dd></div>
          <div><dt>Cantidad</dt><dd>{{ data.cantidad }}</dd></div>
          <div><dt>Precio unitario</dt><dd>{{ data.precioUnitario | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</dd></div>
          <div><dt>Total</dt><dd>{{ data.precioTotal | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</dd></div>
          @if (data.stockProducto !== null && data.stockProducto !== undefined) { <div><dt>Stock actual</dt><dd>{{ data.stockProducto }}</dd></div> }
        </dl>

        <section class="detail-note">
          <h3>Observacion</h3>
          <p>{{ data.detalle || 'Sin detalle' }}</p>
        </section>
      </div>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-flat-button mat-dialog-close type="button"><mat-icon>close</mat-icon>Cerrar</button>
    </mat-dialog-actions>
  `
})
export class TransaccionDetalleDialog {
  readonly data = inject<Transaccion>(MAT_DIALOG_DATA);
}
