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

    public async Task<ApiResponse<DoctorDto>?> GetDoctorAsync(string doctorId)
    {
        var response = await _httpClient.GetAsync($"/doctors/{doctorId}");
        if (!response.IsSuccessStatusCode) return new ApiResponse<DoctorDto> { IsSuccess = false };
        var content = await response.Content.ReadFromJsonAsync<DoctorDto>();
        return new ApiResponse<DoctorDto> { Content = content, IsSuccess = true };
    }

    public async Task<bool> UpdateDoctorStatusAsync(string doctorId, bool isActive)
    {
        var response = await _httpClient.PatchAsync($"/doctors/{doctorId}/status?isActive={isActive}", null);
        return response.IsSuccessStatusCode;
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

public class AuthApiClient : IAuthApiClient
{
    private readonly HttpClient _httpClient;

    public AuthApiClient(HttpClient httpClient)
    {
        _httpClient = httpClient;
    }

    public async Task<List<UserDto>?> GetUsersAsync()
    {
        var response = await _httpClient.GetAsync("/api/users");
        if (!response.IsSuccessStatusCode) return new List<UserDto>();
        return await response.Content.ReadFromJsonAsync<List<UserDto>>();
    }

    public async Task<ApiResponse<UserDto>?> GetUserAsync(string userId)
    {
        var response = await _httpClient.GetAsync($"/api/users/{userId}");
        if (!response.IsSuccessStatusCode) return new ApiResponse<UserDto> { IsSuccess = false };
        var content = await response.Content.ReadFromJsonAsync<UserDto>();
        return new ApiResponse<UserDto> { Content = content, IsSuccess = true };
    }

    public async Task<ApiResponse<UserDto>?> UpdateUserAsync(string userId, object updateRequest)
    {
        var response = await _httpClient.PutAsJsonAsync($"/api/users/{userId}", updateRequest);
        if (!response.IsSuccessStatusCode) return new ApiResponse<UserDto> { IsSuccess = false };
        var content = await response.Content.ReadFromJsonAsync<UserDto>();
        return new ApiResponse<UserDto> { Content = content, IsSuccess = true };
    }
}
