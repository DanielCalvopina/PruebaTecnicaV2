import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmacionDialogData {
  titulo: string;
  mensaje: string;
  textoConfirmar?: string;
}

@Component({
  selector: 'app-confirmacion-dialog',
  imports: [MatButtonModule, MatDialogModule, MatIconModule],
  template: `
    <div class="confirm-dialog">
      <div class="confirm-icon"><mat-icon>warning</mat-icon></div>
      <h2 mat-dialog-title>{{ data.titulo }}</h2>
      <mat-dialog-content>
        <p>{{ data.mensaje }}</p>
      </mat-dialog-content>
      <mat-dialog-actions align="end">
        <button mat-button mat-dialog-close type="button">Cancelar</button>
        <button mat-flat-button color="warn" [mat-dialog-close]="true" type="button">
          <mat-icon>delete</mat-icon>{{ data.textoConfirmar || 'Eliminar' }}
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class ConfirmacionDialog {
  readonly data = inject<ConfirmacionDialogData>(MAT_DIALOG_DATA);
}
