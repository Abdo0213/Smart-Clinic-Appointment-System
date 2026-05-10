using Admin.Infrastructure.Data;
using Admin.Application.Interfaces;
using Admin.Infrastructure.HttpClients;
using Admin.Infrastructure.Services;
using Amazon.S3;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Inter-Service Communication HTTP Clients
builder.Services.AddHttpClient<IAppointmentApiClient, AppointmentApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8084");
});

builder.Services.AddHttpClient<IBillingApiClient, BillingApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8087");
});

builder.Services.AddHttpClient<IVisitApiClient, VisitApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8085");
});

builder.Services.AddHttpClient<IDoctorApiClient, DoctorApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8082");
});

builder.Services.AddHttpClient<IPatientApiClient, PatientApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:8083");
});

builder.Services.AddHttpClient<IAuthApiClient, AuthApiClient>(client =>
{
    client.BaseAddress = new Uri("http://localhost:5005");
});

// Configure Storage Service
var storageType = builder.Configuration["Storage:Type"] ?? "Local";

if (storageType.Equals("S3", StringComparison.OrdinalIgnoreCase))
{
    var awsOptions = builder.Configuration.GetSection("AWS");
    var accessKey = awsOptions["AccessKey"];
    var secretKey = awsOptions["SecretKey"];

    if (!string.IsNullOrEmpty(accessKey) && accessKey != "YOUR_ACCESS_KEY" && 
        !string.IsNullOrEmpty(secretKey) && secretKey != "YOUR_SECRET_KEY")
    {
        builder.Services.AddAWSService<IAmazonS3>();
    }
    else
    {
        builder.Services.AddSingleton<IAmazonS3>(sp => null!); 
    }
    builder.Services.AddScoped<IReportStorageService, S3ReportStorageService>();
}
else
{
    builder.Services.AddScoped<IReportStorageService, LocalReportStorageService>();
}

builder.Services.AddScoped<IPdfService, PdfService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseStaticFiles(); // Required to serve reports from wwwroot
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
