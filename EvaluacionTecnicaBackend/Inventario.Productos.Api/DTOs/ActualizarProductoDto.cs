using System.ComponentModel.DataAnnotations;

namespace Inventario.Productos.Api.Dtos;

public class ActualizarProductoDto
{
    [Required]
    [MaxLength(120)]
    public string Nombre { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Descripcion { get; set; }

    [Required]
    [MaxLength(80)]
    public string Categoria { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Imagen { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Precio { get; set; }
}
