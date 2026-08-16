using Inventario.Productos.Api.Datos;
using Inventario.Productos.Api.Dtos;
using Inventario.Productos.Api.Modelos;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Productos.Api.Servicios;

public class ProductosServicio : IProductosServicio
{
    private readonly ProductosDbContext _db;

    public ProductosServicio(ProductosDbContext db)
    {
        _db = db;
    }

    public async Task<ResultadoPaginadoDto<ProductoRespuestaDto>> ListarAsync(int pagina, int tamanoPagina, string? nombre, string? categoria, decimal? precioMinimo, decimal? precioMaximo, int? stockMinimo, int? stockMaximo)
    {
        pagina = Math.Max(pagina, 1);
        tamanoPagina = Math.Clamp(tamanoPagina, 1, 100);

        var consulta = _db.Productos.AsNoTracking().Where(producto => producto.Activo);

        if (!string.IsNullOrWhiteSpace(nombre))
        {
            consulta = consulta.Where(producto => EF.Functions.ILike(producto.Nombre, $"%{nombre.Trim()}%"));
        }

        if (!string.IsNullOrWhiteSpace(categoria))
        {
            consulta = consulta.Where(producto => EF.Functions.ILike(producto.Categoria, $"%{categoria.Trim()}%"));
        }

        if (precioMinimo.HasValue)
        {
            consulta = consulta.Where(producto => producto.Precio >= precioMinimo.Value);
        }

        if (precioMaximo.HasValue)
        {
            consulta = consulta.Where(producto => producto.Precio <= precioMaximo.Value);
        }

        if (stockMinimo.HasValue)
        {
            consulta = consulta.Where(producto => producto.Stock >= stockMinimo.Value);
        }

        if (stockMaximo.HasValue)
        {
            consulta = consulta.Where(producto => producto.Stock <= stockMaximo.Value);
        }

        var total = await consulta.CountAsync();
        var datos = await consulta
            .OrderBy(producto => producto.Nombre)
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .Select(producto => ARespuesta(producto))
            .ToListAsync();

        return new ResultadoPaginadoDto<ProductoRespuestaDto>
        {
            Pagina = pagina,
            TamanoPagina = tamanoPagina,
            TotalRegistros = total,
            Datos = datos
        };
    }

    public async Task<List<string>> ListarCategoriasAsync()
    {
        return await _db.Productos
            .AsNoTracking()
            .Where(producto => producto.Activo && producto.Categoria != string.Empty)
            .Select(producto => producto.Categoria)
            .Distinct()
            .OrderBy(categoria => categoria)
            .ToListAsync();
    }

    public async Task<ProductoRespuestaDto?> ObtenerAsync(Guid id)
    {
        return await _db.Productos
            .AsNoTracking()
            .Where(producto => producto.Id == id && producto.Activo)
            .Select(producto => ARespuesta(producto))
            .FirstOrDefaultAsync();
    }

    public async Task<ProductoRespuestaDto> CrearAsync(CrearProductoDto dto)
    {
        var producto = new Producto
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre.Trim(),
            Descripcion = NormalizarTextoOpcional(dto.Descripcion),
            Categoria = dto.Categoria.Trim(),
            Imagen = NormalizarTextoOpcional(dto.Imagen),
            Precio = dto.Precio,
            Stock = dto.Stock,
            FechaCreacion = DateTime.UtcNow
        };

        _db.Productos.Add(producto);
        await _db.SaveChangesAsync();
        return ARespuesta(producto);
    }

    public async Task<ProductoRespuestaDto?> ActualizarAsync(Guid id, ActualizarProductoDto dto)
    {
        var producto = await _db.Productos.FirstOrDefaultAsync(producto => producto.Id == id && producto.Activo);

        if (producto is null)
        {
            return null;
        }

        producto.Nombre = dto.Nombre.Trim();
        producto.Descripcion = NormalizarTextoOpcional(dto.Descripcion);
        producto.Categoria = dto.Categoria.Trim();
        producto.Imagen = NormalizarTextoOpcional(dto.Imagen);
        producto.Precio = dto.Precio;
        producto.FechaActualizacion = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return ARespuesta(producto);
    }

    public async Task<bool> EliminarAsync(Guid id)
    {
        var producto = await _db.Productos.FirstOrDefaultAsync(producto => producto.Id == id && producto.Activo);

        if (producto is null)
        {
            return false;
        }

        producto.Activo = false;
        producto.FechaActualizacion = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<(ProductoRespuestaDto? Producto, string? Error)> AjustarStockAsync(Guid id, AjustarStockDto dto)
    {
        if (dto.Cantidad == 0)
        {
            return (null, "La cantidad de ajuste debe ser diferente de cero.");
        }

        var producto = await _db.Productos.FirstOrDefaultAsync(producto => producto.Id == id && producto.Activo);

        if (producto is null)
        {
            return (null, "Producto no encontrado.");
        }

        var nuevoStock = producto.Stock + dto.Cantidad;
        if (nuevoStock < 0)
        {
            return (null, "Stock insuficiente para realizar la transaccion.");
        }

        producto.Stock = nuevoStock;
        producto.FechaActualizacion = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        return (ARespuesta(producto), null);
    }

    private static ProductoRespuestaDto ARespuesta(Producto producto)
    {
        return new ProductoRespuestaDto
        {
            Id = producto.Id,
            Nombre = producto.Nombre,
            Descripcion = producto.Descripcion,
            Categoria = producto.Categoria,
            Imagen = producto.Imagen,
            Precio = producto.Precio,
            Stock = producto.Stock,
            Activo = producto.Activo,
            FechaCreacion = producto.FechaCreacion,
            FechaActualizacion = producto.FechaActualizacion
        };
    }

    private static string? NormalizarTextoOpcional(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }
}
