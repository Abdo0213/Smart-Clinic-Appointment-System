namespace Admin.Application.Interfaces;

public interface IReportStorageService
{
    Task<string> UploadReportAsync(string fileName, string csvContent);
}
