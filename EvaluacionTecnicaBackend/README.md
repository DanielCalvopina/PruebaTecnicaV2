# Backend

Backend .NET 8 para inventario. Esta carpeta contiene la solucion y los dos microservicios:

- `Inventario.Productos.Api`
- `Inventario.Transacciones.Api`

## Base de datos

Usa PostgreSQL. Ejecutar el script antes de iniciar los servicios:

```bash
psql "<cadena-de-conexion-postgresql>" -f database.sql
```

El mismo script tambien esta copiado en la raiz del repositorio.

## Para correr por consola

Tenemos que usar dos terminales.

Terminal 1:

```bash
cd EvaluacionTecnicaBackend
dotnet run --project .\Inventario.Productos.Api\Inventario.Productos.Api.csproj --launch-profile http
```

Terminal 2:

```bash
cd EvaluacionTecnicaBackend
dotnet run --project .\Inventario.Transacciones.Api\Inventario.Transacciones.Api.csproj --launch-profile http
```

Swagger:

- Productos: `http://localhost:5242/swagger`
- Transacciones: `http://localhost:5172/swagger`

Si no se quieres restaurar paquetes:

```bash
dotnet run --no-restore --project .\Inventario.Productos.Api\Inventario.Productos.Api.csproj --launch-profile http
dotnet run --no-restore --project .\Inventario.Transacciones.Api\Inventario.Transacciones.Api.csproj --launch-profile http
```

## Correr desde Visual Studio

Abrir:

```bash
EvaluacionTecnicaInventario.sln
```

Si Visual Studio solo levanta un proyecto, correr el otro desde consola con los comandos de arriba.

## Endpoints

Productos:

- `GET /api/productos`
- `GET /api/productos/categorias`
- `GET /api/productos/{id}`
- `POST /api/productos`
- `POST /api/productos/imagenes`
- `PUT /api/productos/{id}`
- `DELETE /api/productos/{id}`
- `PATCH /api/productos/{id}/stock`

Transacciones:

- `GET /api/transacciones`
- `GET /api/transacciones/{id}`
- `POST /api/transacciones`
- `PUT /api/transacciones/{id}`
- `DELETE /api/transacciones/{id}`

## Reglas

- Compra suma stock.
- Venta resta stock.
- No se permite vender mas stock del disponible.
- El historial se filtra por producto, tipo y fechas.

## Imagenes

El microservicio de productos guarda las imagenes subidas en:

```bash
Inventario.Productos.Api\wwwroot\imagenes-productos
```

El endpoint POST /api/productos/imagenes recibe un archivo de imagen por multipart/form-data y responde la URL que se guarda en el producto.
