import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { map, of, startWith, switchMap } from 'rxjs';
import { Notificaciones } from '../../../core/services/notificaciones';
import { ProductosService } from '../../../core/services/productos';

interface ProductoFormularioData {
  id?: string | null;
  categorias?: string[];
}

@Component({
  selector: 'app-producto-formulario',
  imports: [ReactiveFormsModule, MatAutocompleteModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatIconModule, MatInputModule],
  template: `
    <h2 mat-dialog-title>{{ id ? 'Editar producto' : 'Nuevo producto' }}</h2>

    <form [formGroup]="formulario" (ngSubmit)="guardar()">
      <mat-dialog-content>
        <div class="form-grid">
          <mat-form-field appearance="outline"><mat-label>Nombre</mat-label><input matInput formControlName="nombre" /><mat-error>Obligatorio</mat-error></mat-form-field>
          <mat-form-field appearance="outline">
            <mat-label>Categoria</mat-label>
            <input matInput formControlName="categoria" [matAutocomplete]="categoriasAuto" />
            <mat-autocomplete #categoriasAuto="matAutocomplete">
              @for (item of categoriasFiltradas; track item) { <mat-option [value]="item">{{ item }}</mat-option> }
            </mat-autocomplete>
            <mat-error>Obligatorio</mat-error>
          </mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Precio</mat-label><input matInput type="number" formControlName="precio" /></mat-form-field>
          <mat-form-field appearance="outline"><mat-label>Stock</mat-label><input matInput type="number" formControlName="stock" /></mat-form-field>
          <div class="full-row image-uploader">
            <input #inputImagen hidden type="file" accept="image/png,image/jpeg,image/webp,image/gif" (change)="seleccionarImagen($event)" />
            <button mat-stroked-button type="button" (click)="inputImagen.click()"><mat-icon>image</mat-icon>Seleccionar imagen</button>
            @if (nombreImagen) { <span>{{ nombreImagen }}</span> }
            @if (vistaPrevia || formulario.value.imagen) { <img class="image-preview" [src]="vistaPrevia || formulario.value.imagen" alt="Imagen del producto" /> }
          </div>
          <mat-form-field class="full-row" appearance="outline"><mat-label>Descripcion</mat-label><textarea matInput rows="4" formControlName="descripcion"></textarea></mat-form-field>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancelar</button>
        <button mat-flat-button type="submit"><mat-icon>save</mat-icon>Guardar</button>
      </mat-dialog-actions>
    </form>
  `
})
export class ProductoFormulario implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly dialogRef = inject(MatDialogRef<ProductoFormulario>);
  private readonly data = inject<ProductoFormularioData>(MAT_DIALOG_DATA, { optional: true });
  private readonly productosService = inject(ProductosService);
  private readonly notificaciones = inject(Notificaciones);
  id: string | null = null;
  archivoImagen: File | null = null;
  nombreImagen = '';
  vistaPrevia = '';
  categorias: string[] = [];
  categoriasFiltradas: string[] = [];

  formulario = this.fb.group({
    nombre: ['', [Validators.required, Validators.maxLength(120)]],
    descripcion: [''],
    categoria: ['', [Validators.required, Validators.maxLength(80)]],
    imagen: [''],
    precio: [0, [Validators.required, Validators.min(0)]],
    stock: [0, [Validators.required, Validators.min(0)]]
  });

  ngOnInit(): void {
    this.establecerCategorias(this.data?.categorias ?? []);

    this.productosService.listarCategorias().subscribe({
      next: (categorias) => this.establecerCategorias(categorias),
      error: () => this.cargarCategoriasDesdeProductos()
    });

    this.formulario.controls.categoria.valueChanges
      .pipe(startWith(this.formulario.controls.categoria.value ?? ''))
      .subscribe((valor) => this.filtrarCategorias(valor ?? ''));

    this.id = this.data?.id ?? null;
    if (!this.id) return;
    this.productosService.obtener(this.id).subscribe((p) => {
      this.formulario.patchValue(p);
      this.vistaPrevia = p.imagen ?? '';
      this.formulario.controls.stock.disable();
    });
  }

  private cargarCategoriasDesdeProductos(): void {
    if (this.categorias.length > 0) return;

    this.productosService.listar({ pagina: 1, tamanoPagina: 100 }).subscribe({
      next: (r) => this.establecerCategorias(r.datos.map((producto) => producto.categoria))
    });
  }

  private establecerCategorias(categorias: string[]): void {
    this.categorias = [...new Set(categorias.map((categoria) => categoria.trim()).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b));

    this.filtrarCategorias(this.formulario.controls.categoria.value ?? '');
  }

  private filtrarCategorias(valor: string): void {
    const filtro = valor.trim().toLowerCase();
    this.categoriasFiltradas = this.categorias.filter((categoria) => categoria.toLowerCase().includes(filtro));
  }

  seleccionarImagen(evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const archivo = input.files?.[0] ?? null;

    if (!archivo) return;

    if (!archivo.type.startsWith('image/')) {
      this.notificaciones.error(null, 'Debe seleccionar un archivo de imagen.');
      input.value = '';
      return;
    }

    if (archivo.size > 5_242_880) {
      this.notificaciones.error(null, 'La imagen no puede superar 5 MB.');
      input.value = '';
      return;
    }

    this.archivoImagen = archivo;
    this.nombreImagen = archivo.name;
    this.vistaPrevia = URL.createObjectURL(archivo);
  }

  guardar(): void {
    if (this.formulario.invalid) { this.formulario.markAllAsTouched(); return; }

    const imagen$ = this.archivoImagen
      ? this.productosService.subirImagen(this.archivoImagen).pipe(map((respuesta) => respuesta.url))
      : of(this.formulario.getRawValue().imagen || null);

    imagen$.pipe(
      switchMap((urlImagen) => {
        const v = this.formulario.getRawValue();
        const dto = { nombre: v.nombre ?? '', descripcion: v.descripcion || null, categoria: v.categoria ?? '', imagen: urlImagen, precio: Number(v.precio), stock: Number(v.stock) };
        return this.id ? this.productosService.actualizar(this.id, dto) : this.productosService.crear(dto);
      })
    ).subscribe({
      next: () => { this.notificaciones.exito(this.id ? 'Producto actualizado.' : 'Producto creado.'); this.dialogRef.close(true); },
      error: (e) => this.notificaciones.error(e, 'No fue posible guardar el producto.')
    });
  }
}
