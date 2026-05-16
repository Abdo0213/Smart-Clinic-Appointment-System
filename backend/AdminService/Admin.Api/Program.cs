using Admin.Infrastructure.Data;
using Admin.Application.Interfaces;
using Admin.Infrastructure.HttpClients;
using Admin.Infrastructure.Services;
using Amazon.S3;
using Amazon.Runtime;
using Microsoft.EntityFrameworkCore;
using System.IO;

var dotenv = Path.Combine(Directory.GetCurrentDirectory(), ".env");
if (!File.Exists(dotenv))
{
    dotenv = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, ".env");
}
LoadEnv(dotenv);

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddEnvironmentVariables();

// Map AWS Environment Variables
if (Environment.GetEnvironmentVariable("AWS_ACCESS_KEY") != null)
{
    builder.Configuration["AWS:AccessKey"] = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY");
    builder.Configuration["AWS:SecretKey"] = Environment.GetEnvironmentVariable("AWS_SECRET_KEY");
    builder.Configuration["AWS:Region"] = Environment.GetEnvironmentVariable("AWS_REGION");
}

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure EF Core with PostgreSQL
builder.Services.AddDbContext<AdminDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Configure Inter-Service Communication HTTP Clients
builder.Services.AddHttpClient<IAppointmentApiClient, AppointmentApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["APPOINTMENT_SERVICE_URL"] ?? "http://appointment-service:8084");
});

builder.Services.AddHttpClient<IBillingApiClient, BillingApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["BILLING_SERVICE_URL"] ?? "http://billing-service:8087");
});

builder.Services.AddHttpClient<IVisitApiClient, VisitApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["VISIT_SERVICE_URL"] ?? "http://visit-service:8085");
});

builder.Services.AddHttpClient<IDoctorApiClient, DoctorApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["DOCTOR_SERVICE_URL"] ?? "http://doctor-service:8082");
});

builder.Services.AddHttpClient<IPatientApiClient, PatientApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["PATIENT_SERVICE_URL"] ?? "http://patient-service:8083");
});

builder.Services.AddHttpClient<IAuthApiClient, AuthApiClient>(client =>
{
    client.BaseAddress = new Uri(builder.Configuration["AUTH_SERVICE_URL"] ?? "http://auth-service:8080");
});

// Configure Storage Service
var storageType = builder.Configuration["Storage:Type"] ?? "S3";

if (storageType.Equals("S3", StringComparison.OrdinalIgnoreCase))
{
    var awsOptions = builder.Configuration.GetSection("AWS");
    var accessKey = awsOptions["AccessKey"];
    var secretKey = awsOptions["SecretKey"];

    if (!string.IsNullOrEmpty(accessKey) && accessKey != "YOUR_ACCESS_KEY" && 
        !string.IsNullOrEmpty(secretKey) && secretKey != "YOUR_SECRET_KEY")
    {
        var options = builder.Configuration.GetAWSOptions();
        options.Credentials = new Amazon.Runtime.BasicAWSCredentials(accessKey, secretKey);
        builder.Services.AddDefaultAWSOptions(options);
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

app.UseStaticFiles(); // Required to serve reports from wwwroot
app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();

void LoadEnv(string filePath)
{
    if (!File.Exists(filePath)) return;

    foreach (var line in File.ReadAllLines(filePath))
    {
        if (string.IsNullOrWhiteSpace(line) || line.StartsWith("#")) continue;

        var parts = line.Split('=', 2);
        if (parts.Length != 2) continue;

        var key = parts[0].Trim();
        var value = parts[1].Trim();

        if (value.StartsWith("\"") && value.EndsWith("\""))
            value = value.Substring(1, value.Length - 2);

        Environment.SetEnvironmentVariable(key, value);
    }
}
