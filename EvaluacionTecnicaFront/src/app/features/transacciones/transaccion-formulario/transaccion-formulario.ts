import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Producto } from '../../../core/models/producto';
import { Transaccion } from '../../../core/models/transaccion';
import { Notificaciones } from '../../../core/services/notificaciones';
import { ProductosService } from '../../../core/services/productos';
import { TransaccionesService } from '../../../core/services/transacciones';

interface TransaccionFormularioData {
  id?: string | null;
}

@Component({
  selector: 'app-transaccion-formulario',
  imports: [CurrencyPipe, ReactiveFormsModule, MatButtonModule, MatDatepickerModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule],
  template: `
    <h2 mat-dialog-title>{{ id ? 'Editar transaccion' : 'Nueva transaccion' }}</h2>

    <form [formGroup]="formulario" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline">
            <mat-label>Fecha</mat-label>
            <input matInput [matDatepicker]="fechaPicker" formControlName="fecha" />
            <mat-datepicker-toggle matIconSuffix [for]="fechaPicker"></mat-datepicker-toggle>
            <mat-datepicker #fechaPicker></mat-datepicker>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Tipo</mat-label><mat-select formControlName="tipo"><mat-option value="Compra">Compra</mat-option><mat-option value="Venta">Venta</mat-option></mat-select></mat-form-field>
          <mat-form-field class="full-row" appearance="outline"><mat-label>Producto</mat-label><mat-select formControlName="productoId">@for (p of productos; track p.id) { <mat-option [value]="p.id">{{ p.nombre }} - stock {{ p.stock }}</mat-option> }</mat-select></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Cantidad</mat-label><input matInput type="number" formControlName="cantidad" /><mat-error>Cantidad invalida</mat-error></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Precio unitario</mat-label>
            <input matInput type="number" formControlName="precioUnitario" readonly />
            <mat-hint>Se toma del producto seleccionado.</mat-hint>
          </mat-form-field>
          <mat-form-field class="full-row" appearance="outline"><mat-label>Detalle</mat-label><textarea matInput rows="4" formControlName="detalle"></textarea></mat-form-field>
        </div>
        <p><strong>Total:</strong> {{ total | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}</p>
        @if (ventaInvalida) { <p style="color:#9f1d1d">La venta supera el stock disponible.</p> }
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancelar</button>
        <button mat-flat-button type="submit"><mat-icon>save</mat-icon>Guardar</button>
      </mat-dialog-actions>
    </form>
  `
})
export class TransaccionFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<TransaccionFormulario>);
  private readonly data = inject<TransaccionFormularioData>(MAT_DIALOG_DATA, { optional: true });
  private readonly productosService = inject(ProductosService);
  private readonly transaccionesService = inject(TransaccionesService);
  private readonly notificaciones = inject(Notificaciones);
  id: string | null = null;
  productos: Producto[] = [];
  original: Transaccion | null = null;
  private detalleAutomatico = '';

  formulario = this.fb.group({
    fecha: [new Date() as Date | null],
    tipo: ['Compra' as 'Compra' | 'Venta', Validators.required],
    productoId: ['', Validators.required],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    detalle: ['']
  });

  get total(): number {
    const v = this.formulario.getRawValue();
    return Number(v.cantidad ?? 0) * Number(v.precioUnitario ?? 0);
  }
  get producto(): Producto | undefined { return this.productos.find((p) => p.id === this.formulario.value.productoId); }
  get ventaInvalida(): boolean {
    if (this.formulario.value.tipo !== 'Venta' || !this.producto) return false;
    const stock = this.original?.tipo === 'Venta' && this.original.productoId === this.producto.id ? this.producto.stock + this.original.cantidad : this.producto.stock;
    return Number(this.formulario.value.cantidad ?? 0) > stock;
  }

  ngOnInit(): void {
    this.id = this.data?.id ?? null;
    this.formulario.controls.precioUnitario.disable();
    this.productosService.listar({ pagina: 1, tamanoPagina: 100 }).subscribe((r) => this.productos = r.datos);

    this.formulario.controls.productoId.valueChanges.subscribe((productoId) => {
      this.autollenarDatosProducto(productoId);
    });

    this.formulario.controls.tipo.valueChanges.subscribe(() => {
      this.actualizarDetalleAutomatico();
    });

    if (!this.id) return;
    this.transaccionesService.obtener(this.id).subscribe((t) => {
      this.original = t;
      this.formulario.patchValue({ fecha: new Date(t.fecha), tipo: t.tipo, productoId: t.productoId, cantidad: t.cantidad, precioUnitario: t.precioUnitario, detalle: t.detalle ?? '' }, { emitEvent: false });
    });
  }

  private autollenarDatosProducto(productoId: string | null): void {
    const producto = this.productos.find((p) => p.id === productoId);
    if (!producto) return;

    this.formulario.controls.precioUnitario.setValue(producto.precio);
    this.actualizarDetalleAutomatico();
  }

  private actualizarDetalleAutomatico(): void {
    const producto = this.producto;
    if (!producto) return;

    const tipo = this.formulario.controls.tipo.value ?? 'Compra';
    const nuevoDetalle = `${tipo} de ${producto.nombre}`;
    const detalleActual = this.formulario.controls.detalle.value?.trim() ?? '';

    if (!detalleActual || detalleActual === this.detalleAutomatico) {
      this.detalleAutomatico = nuevoDetalle;
      this.formulario.controls.detalle.setValue(nuevoDetalle);
      return;
    }

    this.detalleAutomatico = nuevoDetalle;
  }

  guardar(): void {
    if (this.formulario.invalid || this.ventaInvalida) { this.formulario.markAllAsTouched(); return; }
    const v = this.formulario.getRawValue();
    const dto = { fecha: this.normalizarFecha(v.fecha), tipo: v.tipo ?? 'Compra', productoId: v.productoId ?? '', cantidad: Number(v.cantidad), precioUnitario: Number(v.precioUnitario), detalle: v.detalle || null };
    const request = this.id ? this.transaccionesService.actualizar(this.id, dto) : this.transaccionesService.crear(dto);
    request.subscribe({ next: () => { this.notificaciones.exito(this.id ? 'Transaccion actualizada.' : 'Transaccion creada.'); this.dialogRef.close(true); }, error: (e) => this.notificaciones.error(e, 'No fue posible guardar la transaccion.') });
  }

  private normalizarFecha(fecha: Date | null): string | null {
    if (!fecha) return null;

    const normalizada = new Date(fecha);
    normalizada.setHours(0, 0, 0, 0);
    return normalizada.toISOString();
  }
}
