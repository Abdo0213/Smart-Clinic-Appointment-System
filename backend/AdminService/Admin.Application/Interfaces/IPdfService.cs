using Admin.Application.DTOs;
using Admin.Domain.Entities;

namespace Admin.Application.Interfaces;

public interface IPdfService
{
    byte[] GenerateAppointmentsReport(AppointmentsReportResponse data);
    byte[] GenerateRevenueReport(RevenueReportResponse data);
    byte[] GenerateVisitsReport(VisitsReportResponse data);
    byte[] GenerateDoctorsReport(DoctorsReportResponse data);
    byte[] GeneratePatientsReport(PatientsReportResponse data);
    byte[] GenerateAuditLogReport(IEnumerable<AuditLog> data);
    byte[] GenerateSummaryReport(SummaryReportResponse data);
}
