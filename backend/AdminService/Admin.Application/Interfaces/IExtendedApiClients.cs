using Admin.Application.DTOs;

namespace Admin.Application.Interfaces;

public interface IVisitApiClient
{
    Task<PaginatedResponse<VisitDto>?> GetVisitsAsync(string? dateFrom, string? dateTo, string? doctorId);
}

public interface IDoctorApiClient
{
    Task<PaginatedResponse<DoctorDto>?> GetDoctorsAsync(string? specialization);
}

public interface IPatientApiClient
{
    Task<PaginatedResponse<PatientDto>?> GetPatientsAsync();
}
