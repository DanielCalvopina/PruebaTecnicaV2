using Inventario.Productos.Api.Dtos;

namespace Inventario.Productos.Api.Servicios;

public interface IProductosServicio
{
    Task<ResultadoPaginadoDto<ProductoRespuestaDto>> ListarAsync(int pagina, int tamanoPagina, string? nombre, string? categoria, decimal? precioMinimo, decimal? precioMaximo, int? stockMinimo, int? stockMaximo);
    Task<List<string>> ListarCategoriasAsync();
    Task<ProductoRespuestaDto?> ObtenerAsync(Guid id);
    Task<ProductoRespuestaDto> CrearAsync(CrearProductoDto dto);
    Task<ProductoRespuestaDto?> ActualizarAsync(Guid id, ActualizarProductoDto dto);
    Task<bool> EliminarAsync(Guid id);
    Task<(ProductoRespuestaDto? Producto, string? Error)> AjustarStockAsync(Guid id, AjustarStockDto dto);
}
