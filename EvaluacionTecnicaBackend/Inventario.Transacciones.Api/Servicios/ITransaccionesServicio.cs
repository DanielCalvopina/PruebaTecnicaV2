using Inventario.Transacciones.Api.Dtos;
using Inventario.Transacciones.Api.Modelos;

namespace Inventario.Transacciones.Api.Servicios;

public interface ITransaccionesServicio
{
    Task<ResultadoPaginadoDto<TransaccionRespuestaDto>> ListarAsync(int pagina, int tamanoPagina, Guid? productoId, TipoTransaccion? tipo, DateTime? fechaDesde, DateTime? fechaHasta);
    Task<TransaccionRespuestaDto?> ObtenerAsync(Guid id);
    Task<TransaccionRespuestaDto> CrearAsync(CrearTransaccionDto dto);
    Task<TransaccionRespuestaDto?> ActualizarAsync(Guid id, ActualizarTransaccionDto dto);
    Task<bool> EliminarAsync(Guid id);
}
