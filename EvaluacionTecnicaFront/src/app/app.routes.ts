import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'productos'
  },
  {
    path: 'productos',
    loadComponent: () =>
      import('./features/productos/productos-lista/productos-lista').then(
        (m) => m.ProductosLista
      )
  },
  {
    path: 'transacciones',
    loadComponent: () =>
      import('./features/transacciones/transacciones-lista/transacciones-lista').then(
        (m) => m.TransaccionesLista
      )
  },
  {
    path: '**',
    redirectTo: 'productos'
  }
];
