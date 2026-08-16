using Inventario.Transacciones.Api.Clientes;
using Inventario.Transacciones.Api.Datos;
using Inventario.Transacciones.Api.Servicios;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDbContext<TransaccionesDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("Postgres")));
builder.Services.AddHttpClient<IProductosCliente, ProductosCliente>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["Servicios:ProductosApi"]!);
});
builder.Services.AddScoped<ITransaccionesServicio, TransaccionesServicio>();

builder.Services.AddControllers()
    .AddJsonOptions(options => options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter()));
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
