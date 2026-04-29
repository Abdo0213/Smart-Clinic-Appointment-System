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
        queryParams.Add("size=10000");

        var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : string.Empty;

        var response = await _httpClient.GetAsync($"/billing/invoices{queryString}");
        if (!response.IsSuccessStatusCode)
        {
            return new PaginatedResponse<InvoiceDto> { Content = new List<InvoiceDto>() };
        }

        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<InvoiceDto>>() ?? new PaginatedResponse<InvoiceDto>();

        if (result.Content != null)
        {
            if (DateTime.TryParse(dateFrom, out var df))
            {
                result.Content = result.Content.Where(a => a.CreatedAt.Date >= df.Date).ToList();
            }
            if (DateTime.TryParse(dateTo, out var dt))
            {
                result.Content = result.Content.Where(a => a.CreatedAt.Date <= dt.Date).ToList();
            }
            result.TotalElements = result.Content.Count;
        }

        return result;
    }
}
