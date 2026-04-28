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

        return await _httpClient.GetFromJsonAsync<PaginatedResponse<VisitDto>>(url);
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

        return await _httpClient.GetFromJsonAsync<PaginatedResponse<DoctorDto>>(url);
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
        return await _httpClient.GetFromJsonAsync<PaginatedResponse<PatientDto>>(url);
    }
}
