using Inventario.Productos.Api.Modelos;
using Microsoft.EntityFrameworkCore;

namespace Inventario.Productos.Api.Datos;

public class ProductosDbContext : DbContext
{
    public ProductosDbContext(DbContextOptions<ProductosDbContext> options) : base(options)
    {
    }

    public DbSet<Producto> Productos => Set<Producto>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Producto>(entity =>
        {
            entity.ToTable("producto");
            entity.HasKey(producto => producto.Id);
            entity.HasIndex(producto => producto.Nombre);
            entity.HasIndex(producto => producto.Categoria);
            entity.Property(producto => producto.Id).HasColumnName("pro_id");
            entity.Property(producto => producto.Nombre).HasColumnName("pro_nombre").IsRequired().HasMaxLength(120);
            entity.Property(producto => producto.Descripcion).HasColumnName("pro_descripcion").HasMaxLength(500);
            entity.Property(producto => producto.Categoria).HasColumnName("pro_categoria").IsRequired().HasMaxLength(80);
            entity.Property(producto => producto.Imagen).HasColumnName("pro_imagen").HasMaxLength(500);
            entity.Property(producto => producto.Precio).HasColumnName("pro_precio").HasColumnType("numeric(18,2)");
            entity.Property(producto => producto.Stock).HasColumnName("pro_stock");
            entity.Property(producto => producto.Activo).HasColumnName("pro_activo");
            entity.Property(producto => producto.FechaCreacion).HasColumnName("fecha_creacion").HasColumnType("timestamp with time zone");
            entity.Property(producto => producto.FechaActualizacion).HasColumnName("fecha_actualizacion").HasColumnType("timestamp with time zone");
        });
    }
}
