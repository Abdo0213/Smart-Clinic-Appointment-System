using Admin.Application.Interfaces;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;

namespace Admin.Infrastructure.Services;

public class LocalReportStorageService : IReportStorageService
{
    private readonly string _storagePath;
    private readonly string _baseUrl;

    public LocalReportStorageService(IHostEnvironment env, IConfiguration config)
    {
        // Default to wwwroot/reports if not configured
        _storagePath = config["Storage:LocalPath"] ?? Path.Combine(env.ContentRootPath, "wwwroot", "reports");
        _baseUrl = config["Storage:BaseUrl"] ?? "http://localhost:8088"; // Match Admin API port

        if (!Directory.Exists(_storagePath))
        {
            Directory.CreateDirectory(_storagePath);
        }
    }

    public async Task<string> UploadReportAsync(string fileName, byte[] content, string contentType)
    {
        var filePath = Path.Combine(_storagePath, fileName);
        await File.WriteAllBytesAsync(filePath, content);

        // Return a URL that can be used to download the file
        return $"{_baseUrl}/reports/{fileName}";
    }
}
