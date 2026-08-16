using Inventario.Transacciones.Api.Modelos;

namespace Inventario.Transacciones.Api.Dtos;

public class TransaccionRespuestaDto
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; }
    public TipoTransaccion Tipo { get; set; }
    public Guid ProductoId { get; set; }
    public string? NombreProducto { get; set; }
    public int? StockProducto { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal PrecioTotal { get; set; }
    public string? Detalle { get; set; }
}
