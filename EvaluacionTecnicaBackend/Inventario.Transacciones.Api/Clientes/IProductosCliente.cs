using Inventario.Transacciones.Api.Dtos;

namespace Inventario.Transacciones.Api.Clientes;

public interface IProductosCliente
{
    Task<ProductoExternoDto?> ObtenerAsync(Guid id);
    Task<ProductoExternoDto> AjustarStockAsync(Guid id, int cantidad, string detalle);
}
