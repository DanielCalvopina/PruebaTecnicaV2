using Inventario.Transacciones.Api.Dtos;
using Inventario.Transacciones.Api.Modelos;
using Inventario.Transacciones.Api.Servicios;
using Microsoft.AspNetCore.Mvc;

namespace Inventario.Transacciones.Api.Controladores;

[ApiController]
[Route("api/transacciones")]
public class TransaccionesController : ControllerBase
{
    private readonly ITransaccionesServicio _transaccionesServicio;

    public TransaccionesController(ITransaccionesServicio transaccionesServicio)
    {
        _transaccionesServicio = transaccionesServicio;
    }

    [HttpGet]
    public async Task<ActionResult<ResultadoPaginadoDto<TransaccionRespuestaDto>>> Listar(
        [FromQuery] int pagina = 1,
        [FromQuery] int tamanoPagina = 10,
        [FromQuery] Guid? productoId = null,
        [FromQuery] TipoTransaccion? tipo = null,
        [FromQuery] DateTime? fechaDesde = null,
        [FromQuery] DateTime? fechaHasta = null)
    {
        return Ok(await _transaccionesServicio.ListarAsync(pagina, tamanoPagina, productoId, tipo, fechaDesde, fechaHasta));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TransaccionRespuestaDto>> Obtener(Guid id)
    {
        var transaccion = await _transaccionesServicio.ObtenerAsync(id);
        return transaccion is null ? NotFound() : Ok(transaccion);
    }

    [HttpPost]
    public async Task<ActionResult<TransaccionRespuestaDto>> Crear(CrearTransaccionDto dto)
    {
        try
        {
            var transaccion = await _transaccionesServicio.CrearAsync(dto);
            return CreatedAtAction(nameof(Obtener), new { id = transaccion.Id }, transaccion);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<TransaccionRespuestaDto>> Actualizar(Guid id, ActualizarTransaccionDto dto)
    {
        try
        {
            var transaccion = await _transaccionesServicio.ActualizarAsync(id, dto);
            return transaccion is null ? NotFound() : Ok(transaccion);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Eliminar(Guid id)
    {
        try
        {
            var eliminado = await _transaccionesServicio.EliminarAsync(id);
            return eliminado ? NoContent() : NotFound();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { mensaje = ex.Message });
        }
    }
}
