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
        // Using date parameter as defined in appointment service /appointments filter
        if (!string.IsNullOrEmpty(dateFrom)) queryParams.Add($"date={dateFrom}"); 
        if (!string.IsNullOrEmpty(doctorId)) queryParams.Add($"doctorId={doctorId}");
        // Request max page size for aggregation
        queryParams.Add("size=10000");

        var queryString = queryParams.Any() ? "?" + string.Join("&", queryParams) : string.Empty;
        
        var response = await _httpClient.GetAsync($"/appointments{queryString}");
        response.EnsureSuccessStatusCode();

        return await response.Content.ReadFromJsonAsync<PaginatedResponse<AppointmentDto>>() ?? new PaginatedResponse<AppointmentDto>();
    }
}
