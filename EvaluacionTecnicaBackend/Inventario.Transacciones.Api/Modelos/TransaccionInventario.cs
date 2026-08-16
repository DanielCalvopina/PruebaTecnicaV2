namespace Inventario.Transacciones.Api.Modelos;

public class TransaccionInventario
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public TipoTransaccion Tipo { get; set; }
    public Guid ProductoId { get; set; }
    public int Cantidad { get; set; }
    public decimal PrecioUnitario { get; set; }
    public decimal PrecioTotal { get; set; }
    public string? Detalle { get; set; }
    public bool Eliminada { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaActualizacion { get; set; }
}
