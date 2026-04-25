using Admin.Application.DTOs;

namespace Admin.Application.Interfaces;

public interface IAppointmentApiClient
{
    Task<PaginatedResponse<AppointmentDto>> GetAppointmentsAsync(string? dateFrom, string? dateTo, string? doctorId);
}
