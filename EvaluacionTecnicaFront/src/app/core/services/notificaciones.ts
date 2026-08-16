import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class Notificaciones {
  constructor(private readonly snackBar: MatSnackBar) {}

  exito(mensaje: string): void {
    this.snackBar.open(mensaje, 'Cerrar', { duration: 3000, horizontalPosition: 'end', verticalPosition: 'top' });
  }

  error(error: unknown, mensajePorDefecto: string): void {
    const respuesta = error as { error?: { mensaje?: string } } | null;
    this.snackBar.open(respuesta?.error?.mensaje ?? mensajePorDefecto, 'Cerrar', {
      duration: 4500,
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }
}
