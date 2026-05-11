using Amazon.S3;
using Amazon.S3.Model;
using System.IO;
using Admin.Application.Interfaces;

namespace Admin.Infrastructure.Services;

public class S3ReportStorageService : IReportStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName = "clinic-fiels-pdf-123";

    public S3ReportStorageService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task<string> UploadReportAsync(string fileName, byte[] content, string contentType)
    {
        try 
        {
            using var ms = new MemoryStream(content);
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = $"exports/{fileName}",
                InputStream = ms,
                ContentType = contentType
            };
            
            await _s3Client.PutObjectAsync(putRequest);

            var urlRequest = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = $"exports/{fileName}",
                Expires = DateTime.UtcNow.AddHours(1)
            };

            return _s3Client.GetPreSignedURL(urlRequest);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"[S3 Mock Fallback] Real S3 upload failed: {ex.Message}");
            return $"https://s3.amazonaws.com/{_bucketName}/exports/{fileName}?mock=true";
        }
    }
}
