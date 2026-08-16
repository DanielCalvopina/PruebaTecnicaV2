namespace Inventario.Transacciones.Api.Dtos;

public class ProductoExternoDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public int Stock { get; set; }
    public bool Activo { get; set; }
}
