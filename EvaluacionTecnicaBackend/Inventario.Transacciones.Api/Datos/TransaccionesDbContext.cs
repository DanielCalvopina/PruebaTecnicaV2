using Inventario.Transacciones.Api.Modelos;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Transacciones.Api.Datos;

public class TransaccionesDbContext : DbContext
{
    public TransaccionesDbContext(DbContextOptions<TransaccionesDbContext> options) : base(options)
    {
    }

    public DbSet<TransaccionInventario> Transacciones => Set<TransaccionInventario>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<TransaccionInventario>(entity =>
        {
            entity.ToTable("transaccion_inventario");
            entity.HasKey(transaccion => transaccion.Id);
            entity.HasIndex(transaccion => transaccion.ProductoId);
            entity.HasIndex(transaccion => transaccion.Tipo);
            entity.HasIndex(transaccion => transaccion.Fecha);
            entity.Property(transaccion => transaccion.Id).HasColumnName("tra_id");
            entity.Property(transaccion => transaccion.Fecha).HasColumnName("tra_fecha").HasColumnType("timestamp with time zone");
            entity.Property(transaccion => transaccion.Tipo).HasColumnName("tra_tipo").HasConversion<string>().HasMaxLength(20);
            entity.Property(transaccion => transaccion.ProductoId).HasColumnName("pro_id");
            entity.Property(transaccion => transaccion.Cantidad).HasColumnName("tra_cantidad");
            entity.Property(transaccion => transaccion.PrecioUnitario).HasColumnName("tra_precio_unitario").HasColumnType("numeric(18,2)");
            entity.Property(transaccion => transaccion.PrecioTotal).HasColumnName("tra_precio_total").HasColumnType("numeric(18,2)");
            entity.Property(transaccion => transaccion.Detalle).HasColumnName("tra_detalle").HasMaxLength(500);
            entity.Property(transaccion => transaccion.Eliminada).HasColumnName("tra_eliminada");
            entity.Property(transaccion => transaccion.FechaCreacion).HasColumnName("fecha_creacion").HasColumnType("timestamp with time zone");
            entity.Property(transaccion => transaccion.FechaActualizacion).HasColumnName("fecha_actualizacion").HasColumnType("timestamp with time zone");
        });
    }
}
