using System.Net.Http.Json;
using Admin.Application.DTOs;
using Admin.Application.Interfaces;

namespace Admin.Infrastructure.HttpClients;

public class VisitApiClient : IVisitApiClient
{
    private readonly HttpClient _httpClient;

    public VisitApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PaginatedResponse<VisitDto>?> GetVisitsAsync(string? dateFrom, string? dateTo, string? doctorId)
    {
        var url = $"/visits?size=10000";
        if (!string.IsNullOrEmpty(dateFrom)) url += $"&dateFrom={dateFrom}";
        if (!string.IsNullOrEmpty(dateTo)) url += $"&dateTo={dateTo}";
        if (!string.IsNullOrEmpty(doctorId)) url += $"&doctorId={doctorId}";

        var response = await _httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode) return new PaginatedResponse<VisitDto> { Content = new List<VisitDto>() };
        return await response.Content.ReadFromJsonAsync<PaginatedResponse<VisitDto>>();
    }
}

public class DoctorApiClient : IDoctorApiClient
{
    private readonly HttpClient _httpClient;

    public DoctorApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PaginatedResponse<DoctorDto>?> GetDoctorsAsync(string? specialization)
    {
        var url = $"/doctors?size=1000";
        if (!string.IsNullOrEmpty(specialization)) url += $"&specialization={specialization}";

        var response = await _httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode) return new PaginatedResponse<DoctorDto> { Content = new List<DoctorDto>() };
        return await response.Content.ReadFromJsonAsync<PaginatedResponse<DoctorDto>>();
    }
}

public class PatientApiClient : IPatientApiClient
{
    private readonly HttpClient _httpClient;

    public PatientApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<PaginatedResponse<PatientDto>?> GetPatientsAsync()
    {
        var url = $"/patients?size=10000";
        var response = await _httpClient.GetAsync(url);
        if (!response.IsSuccessStatusCode) return new PaginatedResponse<PatientDto> { Content = new List<PatientDto>() };
        return await response.Content.ReadFromJsonAsync<PaginatedResponse<PatientDto>>();
    }
}
