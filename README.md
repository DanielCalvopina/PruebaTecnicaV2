# Prueba tecnica - Inventario

Proyecto de inventario separado en dos partes:

- `EvaluacionTecnicaBackend`: backend .NET 8 con dos microservicios.
- `EvaluacionTecnicaFront`: frontend Angular 20.

La base de datos usada es PostgreSQL.

## 1. Base de datos

Antes de correr el proyecto, ejecutar el script:

```bash
psql "<cadena-de-conexion-postgresql>" -f database.sql
```

El archivo `database.sql` esta en la raiz del repositorio y crea las tablas:

- `producto`
- `transaccion_inventario`

## 2. Para correr backend por consola

Abrir una terminal en la raiz del repositorio.

Terminal 1, productos:

```bash
cd EvaluacionTecnicaBackend
dotnet run --project .\Inventario.Productos.Api\Inventario.Productos.Api.csproj --launch-profile http
```

Terminal 2, transacciones:

```bash
cd EvaluacionTecnicaBackend
dotnet run --project .\Inventario.Transacciones.Api\Inventario.Transacciones.Api.csproj --launch-profile http
```

Swagger queda en:

- Productos: `http://localhost:5242/swagger`
- Transacciones: `http://localhost:5172/swagger`

Tambien se puede abrir la solucion en Visual Studio:

```bash
EvaluacionTecnicaBackend\EvaluacionTecnicaInventario.sln
```

Pero para correr los dos microservicios al mismo tiempo, lo mas directo es usar dos terminales.

## 3. Correr frontend

Abrir otra terminal:

```bash
cd EvaluacionTecnicaFront
npm install
npm run start
```

Angular queda en:

```bash
http://localhost:4200
```

Para compilar:

```bash
npm run build
```

## 4. Que incluye

- CRUD de productos.
- CRUD de transacciones.
- Carga de imagen para productos.
- Categorias tomadas de los productos existentes.
- Compra aumenta stock.
- Venta disminuye stock.
- No permite vender mas stock del disponible.
- Filtros y paginacion en productos.
- Filtros y paginacion en transacciones.
- Formularios de crear y editar en ventanas emergentes.
- Detalle de producto en ventana emergente con historial filtrable.
- Fechas seleccionadas con calendario.
- Precio unitario de transaccion autollenado desde el producto.
- Detalle de transaccion visible en ventana emergente.
- Swagger en los dos microservicios.

Las imagenes de productos se guardan en el backend de productos, en:

```bash
EvaluacionTecnicaBackend\Inventario.Productos.Api\wwwroot\imagenes-productos
```

El producto se guardan en la base de datos la URL de la imagen. Si se reinicia el API despues de cambiar codigo, las imagenes vuelven a servirse desde `http://localhost:5242/imagenes-productos/`.

## 5. Evidencias

Guardar las capturas en `evidencias/`.

Capturas recomendadas:

- Swagger de productos.
- Swagger de transacciones.
- Listado de productos.
- Crear o editar producto.
- Listado de transacciones.
- Crear compra.
- Crear venta.
- Validacion de venta mayor al stock.
- Detalle de producto con historial.
