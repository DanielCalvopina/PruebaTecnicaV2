namespace Inventario.Transacciones.Api.Dtos;

public class ResultadoPaginadoDto<T>
{
    public int Pagina { get; set; }
    public int TamanoPagina { get; set; }
    public int TotalRegistros { get; set; }
    public int TotalPaginas => TamanoPagina == 0 ? 0 : (int)Math.Ceiling(TotalRegistros / (double)TamanoPagina);
    public IReadOnlyList<T> Datos { get; set; } = [];
}
