using System.Net.Http.Json;
using Admin.Application.DTOs;
using Admin.Application.Interfaces;

namespace Admin.Infrastructure.HttpClients;

public class AppointmentApiClient : IAppointmentApiClient
{
    private readonly HttpClient _httpClient;

    public AppointmentApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PaginatedResponse<AppointmentDto>> GetAppointmentsAsync(string? dateFrom, string? dateTo, string? doctorId)
    {
        var queryParams = new List<string>();
        if (!string.IsNullOrEmpty(doctorId)) queryParams.Add($"doctorId={doctorId}");
        // Request max page size for aggregation
        queryParams.Add("size=10000");

        var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : string.Empty;
        
        var response = await _httpClient.GetAsync($"/appointments{queryString}");
        if (!response.IsSuccessStatusCode)
        {
            return new PaginatedResponse<AppointmentDto> { Content = new List<AppointmentDto>() };
        }

        var result = await response.Content.ReadFromJsonAsync<PaginatedResponse<AppointmentDto>>() ?? new PaginatedResponse<AppointmentDto>();

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
