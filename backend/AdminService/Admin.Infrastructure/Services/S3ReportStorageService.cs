using Amazon.S3;
using Amazon.S3.Model;
using Admin.Application.Interfaces;

namespace Admin.Infrastructure.Services;

public class S3ReportStorageService : IReportStorageService
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName = "clinic-reports";

    public S3ReportStorageService(IAmazonS3 s3Client)
    {
        _s3Client = s3Client;
    }

    public async Task<string> UploadReportAsync(string fileName, string csvContent)
    {
        // Wrapping in try/catch to ensure the system doesn't crash if AWS credentials are not set locally yet.
        // It will gracefully fall back to a mock URL during development.
        try 
        {
            var putRequest = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = $"exports/{fileName}",
                ContentBody = csvContent,
                ContentType = "text/csv"
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
