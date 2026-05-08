using Admin.Application.DTOs;

namespace Admin.Application.Interfaces;

public interface IVisitApiClient
{
    Task<PaginatedResponse<VisitDto>?> GetVisitsAsync(string? dateFrom, string? dateTo, string? doctorId);
}

public interface IDoctorApiClient
{
    Task<PaginatedResponse<DoctorDto>?> GetDoctorsAsync(string? specialization);
    Task<ApiResponse<DoctorDto>?> GetDoctorAsync(string doctorId);
    Task<bool> UpdateDoctorStatusAsync(string doctorId, bool isActive);
}

public interface IPatientApiClient
{
    Task<PaginatedResponse<PatientDto>?> GetPatientsAsync();
}

public interface IAuthApiClient
{
    Task<PaginatedResponse<UserDto>?> GetUsersAsync(int page = 0, int size = 10, string? search = null);
    Task<ApiResponse<UserDto>?> GetUserAsync(string userId);
    Task<ApiResponse<UserDto>?> UpdateUserAsync(string userId, object updateRequest);
}
