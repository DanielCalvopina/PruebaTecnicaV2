using System.ComponentModel.DataAnnotations;

namespace Inventario.Productos.Api.Dtos;

public class AjustarStockDto
{
    public int Cantidad { get; set; }

    [MaxLength(200)]
    public string? Detalle { get; set; }
}
