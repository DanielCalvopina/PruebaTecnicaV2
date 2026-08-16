using Inventario.Transacciones.Api.Dtos;
using System.Net;
using System.Net.Http.Json;

namespace Inventario.Transacciones.Api.Clientes;

public class ProductosCliente : IProductosCliente
{
    private readonly HttpClient _httpClient;

    public ProductosCliente(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<ProductoExternoDto?> ObtenerAsync(Guid id)
    {
        var respuesta = await _httpClient.GetAsync($"api/productos/{id}");

        if (respuesta.StatusCode == HttpStatusCode.NotFound)
        {
            return null;
        }

        respuesta.EnsureSuccessStatusCode();
        return await respuesta.Content.ReadFromJsonAsync<ProductoExternoDto>();
    }

    public async Task<ProductoExternoDto> AjustarStockAsync(Guid id, int cantidad, string detalle)
    {
        var respuesta = await _httpClient.PatchAsJsonAsync($"api/productos/{id}/stock", new AjustarStockProductoDto
        {
            Cantidad = cantidad,
            Detalle = detalle
        });

        if (respuesta.IsSuccessStatusCode)
        {
            var producto = await respuesta.Content.ReadFromJsonAsync<ProductoExternoDto>();
            return producto ?? throw new InvalidOperationException("ProductosApi no retorno informacion del producto.");
        }

        var error = await respuesta.Content.ReadFromJsonAsync<MensajeErrorDto>();
        throw new InvalidOperationException(error?.Mensaje ?? "No fue posible ajustar el stock del producto.");
    }
}
