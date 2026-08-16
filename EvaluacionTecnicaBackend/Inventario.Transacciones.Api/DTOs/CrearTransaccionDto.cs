using Inventario.Transacciones.Api.Modelos;
using System.ComponentModel.DataAnnotations;

namespace Inventario.Transacciones.Api.Dtos;

public class CrearTransaccionDto
{
    public DateTime? Fecha { get; set; }

    [Required]
    public TipoTransaccion Tipo { get; set; }

    [Required]
    public Guid ProductoId { get; set; }

    [Range(1, int.MaxValue)]
    public int Cantidad { get; set; }

    [Range(0, double.MaxValue)]
    public decimal PrecioUnitario { get; set; }

    [MaxLength(500)]
    public string? Detalle { get; set; }
}
