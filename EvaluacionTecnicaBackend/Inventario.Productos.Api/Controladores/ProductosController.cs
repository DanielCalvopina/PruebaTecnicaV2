using Inventario.Productos.Api.Dtos;
using Inventario.Productos.Api.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace Inventario.Productos.Api.Controladores;

[ApiController]
[Route("api/productos")]
public class ProductosController : ControllerBase
{
    private readonly IProductosServicio _productosServicio;
    private readonly IWebHostEnvironment _environment;
    private static readonly string[] ExtensionesPermitidas = [".jpg", ".jpeg", ".png", ".webp", ".gif"];

    public ProductosController(IProductosServicio productosServicio, IWebHostEnvironment environment)
    {
        _productosServicio = productosServicio;
        _environment = environment;
    }

    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<ProductoRespuestaDto>>> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 10,
        [FromQuery] string? nombre = null,
        [FromQuery] string? categoria = null,
        [FromQuery] decimal? precioMinimo = null,
        [FromQuery] decimal? precioMaximo = null,
        [FromQuery] int? stockMinimo = null,
        [FromQuery] int? stockMaximo = null)
    {
        return Ok(await _productosServicio.ListarAsync(pagina, tamanoPagina, nombre, categoria, precioMinimo, precioMaximo, stockMinimo, stockMaximo));
    }

    [HttpGet("categorias")]
    public async Task<ActionResult<List<string>>> ListarCategorias()
    {
        return Ok(await _productosServicio.ListarCategoriasAsync());
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductoRespuestaDto>> Obtener(Guid id)
    {
        var producto = await _productosServicio.ObtenerAsync(id);
        return producto is null ? NotFound() : Ok(producto);
    }

    [HttpPost]
    public async Task<ActionResult<ProductoRespuestaDto>> Crear(CrearProductoDto dto)
    {
        var producto = await _productosServicio.CrearAsync(dto);
        return CreatedAtAction(nameof(Obtener), new { id = producto.Id }, producto);
    }

    [HttpPost("imagenes")]
    [RequestSizeLimit(5_242_880)]
    public async Task<ActionResult<ImagenProductoRespuestaDto>> SubirImagen(IFormFile imagen)
    {
        if (imagen.Length == 0)
        {
            return BadRequest(new { mensaje = "Debe seleccionar una imagen." });
        }

        if (imagen.Length > 5_242_880)
        {
            return BadRequest(new { mensaje = "La imagen no puede superar 5 MB." });
        }

        var extension = Path.GetExtension(imagen.FileName).ToLowerInvariant();
        if (!ExtensionesPermitidas.Contains(extension) || !imagen.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { mensaje = "Formato de imagen no permitido." });
        }

        var carpeta = Path.Combine(_environment.ContentRootPath, "wwwroot", "imagenes-productos");
        Directory.CreateDirectory(carpeta);

        var nombreArchivo = $"{Guid.NewGuid():N}{extension}";
        var rutaArchivo = Path.Combine(carpeta, nombreArchivo);

        await using var stream = System.IO.File.Create(rutaArchivo);
        await imagen.CopyToAsync(stream);

        var url = $"{Request.Scheme}://{Request.Host}/imagenes-productos/{nombreArchivo}";
        return Ok(new ImagenProductoRespuestaDto { Url = url });
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ProductoRespuestaDto>> Actualizar(Guid id, ActualizarProductoDto dto)
    {
        var producto = await _productosServicio.ActualizarAsync(id, dto);
        return producto is null ? NotFound() : Ok(producto);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        var eliminado = await _productosServicio.EliminarAsync(id);
        return eliminado ? NoContent() : NotFound();
    }

    [HttpPatch("{id:guid}/stock")]
    public async Task<ActionResult<ProductoRespuestaDto>> AjustarStock(Guid id, AjustarStockDto dto)
    {
        var resultado = await _productosServicio.AjustarStockAsync(id, dto);

        if (resultado.Producto is not null)
        {
            return Ok(resultado.Producto);
        }

        if (resultado.Error == "Producto no encontrado.")
        {
            return NotFound(new { mensaje = resultado.Error });
        }

        return Conflict(new { mensaje = resultado.Error });
    }
}
