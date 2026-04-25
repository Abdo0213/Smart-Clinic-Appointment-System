using System.Net.Http.Json;
using Admin.Application.DTOs;
using Admin.Application.Interfaces;

namespace Admin.Infrastructure.HttpClients;

public class BillingApiClient : IBillingApiClient
{
    private readonly HttpClient _httpClient;

    public BillingApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PaginatedResponse<InvoiceDto>> GetInvoicesAsync(string? dateFrom, string? dateTo)
    {
        var queryParams = new List<string>();
        if (!string.IsNullOrEmpty(dateFrom)) queryParams.Add($"dateFrom={dateFrom}");
        if (!string.IsNullOrEmpty(dateTo)) queryParams.Add($"dateTo={dateTo}");
        // Request max page size for aggregation
        queryParams.Add("size=10000");

        var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : string.Empty;

        var response = await _httpClient.GetAsync($"/billing/invoices{queryString}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<PaginatedResponse<InvoiceDto>>() ?? new PaginatedResponse<InvoiceDto>();
    }
}
