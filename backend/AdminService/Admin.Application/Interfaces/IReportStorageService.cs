namespace Admin.Application.Interfaces;

public interface IReportStorageService
{
    Task<string> UploadReportAsync(string fileName, byte[] content, string contentType);
}
