using Admin.Application.DTOs;

namespace Admin.Application.Interfaces;

public interface IBillingApiClient
{
    Task<PaginatedResponse<InvoiceDto>> GetInvoicesAsync(string? dateFrom, string? dateTo);
}
