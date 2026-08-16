# Frontend

Antes de abrir el front de Angular, deben estar corriendo los 2 backends:

- Productos: `http://localhost:5242`
- Transacciones: `http://localhost:5172`

El proxy esta en guardado en `proxy.conf.json`:

- `/productos-api` -> `http://localhost:5242`
- `/transacciones-api` -> `http://localhost:5172`

## Para instalar las depedencias

```bash
npm install
```

## Para Ejecutar el frontend

```bash
npm run start
```

Abrir:

```bash
http://localhost:4200
```

## Para compitar en caso de ser necesario

```bash
npm run build
```

## Pantallas

Productos:

- listado con paginacion
- filtros por nombre, categoria existente, precio y stock
- sugerencias de categorias existentes en el formulario
- carga de imagen desde el formulario
- crear y editar en ventana emergente
- eliminar con confirmacion
- detalle en ventana emergente con historial

Transacciones:

- listado con paginacion
- filtros por producto, tipo y fechas
- seleccion de fechas con calendario
- precio unitario autollenado al escoger producto
- detalle visible en ventana emergente
- crear compra o venta en ventana emergente
- editar en ventana emergente
- eliminar con confirmacion
- validacion para no vender mas del stock disponible
