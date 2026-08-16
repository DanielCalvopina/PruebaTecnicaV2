using Inventario.Transacciones.Api.Clientes;
using Inventario.Transacciones.Api.Datos;
using Inventario.Transacciones.Api.Dtos;
using Inventario.Transacciones.Api.Modelos;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Transacciones.Api.Servicios;

public class TransaccionesServicio : ITransaccionesServicio
{
    private readonly TransaccionesDbContext _db;
    private readonly IProductosCliente _productosCliente;

    public TransaccionesServicio(TransaccionesDbContext db, IProductosCliente productosCliente)
    {
        _db = db;
        _productosCliente = productosCliente;
    }

    public async Task<ResultadoPaginadoDto<TransaccionRespuestaDto>> ListarAsync(int pagina, int tamanoPagina, Guid? productoId, TipoTransaccion? tipo, DateTime? fechaDesde, DateTime? fechaHasta)
    {
        pagina = Math.Max(pagina, 1);
        tamanoPagina = Math.Clamp(tamanoPagina, 1, 100);

        var consulta = _db.Transacciones.AsNoTracking().Where(transaccion => !transaccion.Eliminada);

        if (productoId.HasValue)
        {
            consulta = consulta.Where(transaccion => transaccion.ProductoId == productoId.Value);
        }

        if (tipo.HasValue)
        {
            consulta = consulta.Where(transaccion => transaccion.Tipo == tipo.Value);
        }

        var fechaDesdeUtc = NormalizarFecha(fechaDesde);
        var fechaHastaUtc = NormalizarFecha(fechaHasta);

        if (fechaDesdeUtc.HasValue)
        {
            consulta = consulta.Where(transaccion => transaccion.Fecha >= fechaDesdeUtc.Value);
        }

        if (fechaHastaUtc.HasValue)
        {
            consulta = consulta.Where(transaccion => transaccion.Fecha <= fechaHastaUtc.Value);
        }

        var total = await consulta.CountAsync();
        var transacciones = await consulta
            .OrderByDescending(transaccion => transaccion.Fecha)
            .Skip((pagina - 1) * tamanoPagina)
            .Take(tamanoPagina)
            .ToListAsync();

        return new ResultadoPaginadoDto<TransaccionRespuestaDto>
        {
            Pagina = pagina,
            TamanoPagina = tamanoPagina,
            TotalRegistros = total,
            Datos = await ARespuestasAsync(transacciones)
        };
    }

    public async Task<TransaccionRespuestaDto?> ObtenerAsync(Guid id)
    {
        var transaccion = await _db.Transacciones
            .AsNoTracking()
            .FirstOrDefaultAsync(transaccion => transaccion.Id == id && !transaccion.Eliminada);

        return transaccion is null ? null : await ARespuestaAsync(transaccion);
    }

    public async Task<TransaccionRespuestaDto> CrearAsync(CrearTransaccionDto dto)
    {
        await ValidarProductoAsync(dto.ProductoId);

        var ajuste = CantidadFirmada(dto.Tipo, dto.Cantidad);
        await _productosCliente.AjustarStockAsync(dto.ProductoId, ajuste, $"Creacion de transaccion {dto.Tipo}");

        var transaccion = new TransaccionInventario
        {
            Id = Guid.NewGuid(),
            Fecha = NormalizarFecha(dto.Fecha) ?? DateTime.UtcNow,
            Tipo = dto.Tipo,
            ProductoId = dto.ProductoId,
            Cantidad = dto.Cantidad,
            PrecioUnitario = dto.PrecioUnitario,
            PrecioTotal = CalcularTotal(dto.Cantidad, dto.PrecioUnitario),
            Detalle = NormalizarTextoOpcional(dto.Detalle),
            FechaCreacion = DateTime.UtcNow
        };

        _db.Transacciones.Add(transaccion);

        try
        {
            await _db.SaveChangesAsync();
        }
        catch
        {
            await _productosCliente.AjustarStockAsync(dto.ProductoId, -ajuste, $"Compensacion de transaccion {transaccion.Id}");
            throw;
        }

        return await ARespuestaAsync(transaccion);
    }

    public async Task<TransaccionRespuestaDto?> ActualizarAsync(Guid id, ActualizarTransaccionDto dto)
    {
        var transaccion = await _db.Transacciones.FirstOrDefaultAsync(transaccion => transaccion.Id == id && !transaccion.Eliminada);

        if (transaccion is null)
        {
            return null;
        }

        await ValidarProductoAsync(dto.ProductoId);
        await AplicarAjusteActualizacionAsync(transaccion, dto);

        transaccion.Fecha = NormalizarFecha(dto.Fecha) ?? transaccion.Fecha;
        transaccion.Tipo = dto.Tipo;
        transaccion.ProductoId = dto.ProductoId;
        transaccion.Cantidad = dto.Cantidad;
        transaccion.PrecioUnitario = dto.PrecioUnitario;
        transaccion.PrecioTotal = CalcularTotal(dto.Cantidad, dto.PrecioUnitario);
        transaccion.Detalle = NormalizarTextoOpcional(dto.Detalle);
        transaccion.FechaActualizacion = DateTime.UtcNow;

        await _db.SaveChangesAsync();
        return await ARespuestaAsync(transaccion);
    }

    public async Task<bool> EliminarAsync(Guid id)
    {
        var transaccion = await _db.Transacciones.FirstOrDefaultAsync(transaccion => transaccion.Id == id && !transaccion.Eliminada);

        if (transaccion is null)
        {
            return false;
        }

        var ajusteReversion = -CantidadFirmada(transaccion.Tipo, transaccion.Cantidad);
        await _productosCliente.AjustarStockAsync(transaccion.ProductoId, ajusteReversion, $"Eliminacion de transaccion {transaccion.Id}");

        transaccion.Eliminada = true;
        transaccion.FechaActualizacion = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    private async Task ValidarProductoAsync(Guid productoId)
    {
        var producto = await _productosCliente.ObtenerAsync(productoId);

        if (producto is null || !producto.Activo)
        {
            throw new InvalidOperationException("Producto no encontrado.");
        }
    }

    private async Task AplicarAjusteActualizacionAsync(TransaccionInventario anterior, ActualizarTransaccionDto nuevo)
    {
        if (anterior.ProductoId == nuevo.ProductoId)
        {
            var ajusteAnterior = CantidadFirmada(anterior.Tipo, anterior.Cantidad);
            var ajusteNuevo = CantidadFirmada(nuevo.Tipo, nuevo.Cantidad);
            var diferencia = ajusteNuevo - ajusteAnterior;

            if (diferencia != 0)
            {
                await _productosCliente.AjustarStockAsync(nuevo.ProductoId, diferencia, $"Actualizacion de transaccion {anterior.Id}");
            }

            return;
        }

        var reversionAnterior = -CantidadFirmada(anterior.Tipo, anterior.Cantidad);
        await _productosCliente.AjustarStockAsync(anterior.ProductoId, reversionAnterior, $"Reversion de transaccion {anterior.Id}");

        try
        {
            var ajusteNuevo = CantidadFirmada(nuevo.Tipo, nuevo.Cantidad);
            await _productosCliente.AjustarStockAsync(nuevo.ProductoId, ajusteNuevo, $"Actualizacion de transaccion {anterior.Id}");
        }
        catch
        {
            await _productosCliente.AjustarStockAsync(anterior.ProductoId, -reversionAnterior, $"Compensacion de transaccion {anterior.Id}");
            throw;
        }
    }

    private async Task<IReadOnlyList<TransaccionRespuestaDto>> ARespuestasAsync(IReadOnlyList<TransaccionInventario> transacciones)
    {
        var productos = new Dictionary<Guid, ProductoExternoDto?>();

        foreach (var productoId in transacciones.Select(transaccion => transaccion.ProductoId).Distinct())
        {
            productos[productoId] = await _productosCliente.ObtenerAsync(productoId);
        }

        return transacciones.Select(transaccion => ARespuesta(transaccion, productos[transaccion.ProductoId])).ToList();
    }

    private async Task<TransaccionRespuestaDto> ARespuestaAsync(TransaccionInventario transaccion)
    {
        var producto = await _productosCliente.ObtenerAsync(transaccion.ProductoId);
        return ARespuesta(transaccion, producto);
    }

    private static TransaccionRespuestaDto ARespuesta(TransaccionInventario transaccion, ProductoExternoDto? producto)
    {
        return new TransaccionRespuestaDto
        {
            Id = transaccion.Id,
            Fecha = transaccion.Fecha,
            Tipo = transaccion.Tipo,
            ProductoId = transaccion.ProductoId,
            NombreProducto = producto?.Nombre,
            StockProducto = producto?.Stock,
            Cantidad = transaccion.Cantidad,
            PrecioUnitario = transaccion.PrecioUnitario,
            PrecioTotal = transaccion.PrecioTotal,
            Detalle = transaccion.Detalle
        };
    }

    private static int CantidadFirmada(TipoTransaccion tipo, int cantidad)
    {
        return tipo == TipoTransaccion.Compra ? cantidad : -cantidad;
    }

    private static decimal CalcularTotal(int cantidad, decimal precioUnitario)
    {
        return cantidad * precioUnitario;
    }

    private static string? NormalizarTextoOpcional(string? valor)
    {
        return string.IsNullOrWhiteSpace(valor) ? null : valor.Trim();
    }

    private static DateTime? NormalizarFecha(DateTime? fecha)
    {
        if (!fecha.HasValue)
        {
            return null;
        }

        return fecha.Value.Kind switch
        {
            DateTimeKind.Utc => fecha.Value,
            DateTimeKind.Local => fecha.Value.ToUniversalTime(),
            _ => DateTime.SpecifyKind(fecha.Value, DateTimeKind.Utc)
        };
    }
}
