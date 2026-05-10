using Admin.Application.DTOs;
using Admin.Application.Interfaces;
using Admin.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Admin.Infrastructure.Services;

public class PdfService : IPdfService
{
    public PdfService()
    {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public byte[] GenerateAppointmentsReport(AppointmentsReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                page.Header().Row(row =>
                {
                    row.RelativeItem().Column(col =>
                    {
                        col.Item().Text("Smart Clinic - Appointment Report").FontSize(20).SemiBold().FontColor(Colors.Blue.Medium);
                        col.Item().Text($"Period: {data.Period.From} to {data.Period.To}");
                    });
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(x =>
                {
                    x.Spacing(10);
                    x.Item().Row(row =>
                    {
                        row.RelativeItem().Border(1).Padding(5).Column(c => {
                            c.Item().Text("Total").SemiBold();
                            c.Item().Text(data.TotalAppointments.ToString());
                        });
                        row.RelativeItem().Border(1).Padding(5).Column(c => {
                            c.Item().Text("Completed").SemiBold();
                            c.Item().Text(data.Completed.ToString());
                        });
                        row.RelativeItem().Border(1).Padding(5).Column(c => {
                            c.Item().Text("Cancelled").SemiBold();
                            c.Item().Text(data.Cancelled.ToString());
                        });
                    });

                    x.Item().Table(table =>
                    {
                        table.ColumnsDefinition(columns =>
                        {
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                            columns.RelativeColumn();
                        });

                        table.Header(header =>
                        {
                            header.Cell().Element(CellStyle).Text("Date");
                            header.Cell().Element(CellStyle).Text("Patient");
                            header.Cell().Element(CellStyle).Text("Doctor");
                            header.Cell().Element(CellStyle).Text("Status");
                            static IContainer CellStyle(IContainer container) => container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1);
                        });

                        foreach (var item in data.Records)
                        {
                            table.Cell().Element(CellStyle).Text(item.SlotDate);
                            table.Cell().Element(CellStyle).Text(item.PatientName);
                            table.Cell().Element(CellStyle).Text(item.DoctorName);
                            table.Cell().Element(CellStyle).Text(item.Status);
                            static IContainer CellStyle(IContainer container) => container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5);
                        }
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateRevenueReport(RevenueReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Column(col =>
                {
                    col.Item().Text("Smart Clinic - Revenue Report").FontSize(20).SemiBold();
                    col.Item().Text($"Period: {data.Period.From} to {data.Period.To}").FontSize(10).Italic();
                });
                
                page.Content().PaddingVertical(1, Unit.Centimetre).Column(x =>
                {
                    x.Item().Text($"Total Billed: ${data.TotalBilled:N2}");
                    x.Item().Text($"Total Collected: ${data.TotalCollected:N2}");
                    
                    x.Item().PaddingTop(10).Table(table =>
                    {
                        table.ColumnsDefinition(columns => { columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); });
                        table.Header(header => { header.Cell().Text("Patient"); header.Cell().Text("Amount"); header.Cell().Text("Status"); });
                        foreach (var item in data.Records) { table.Cell().Text(item.PatientName); table.Cell().Text($"${item.TotalAmount:N2}"); table.Cell().Text(item.Status); }
                    });
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateVisitsReport(VisitsReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Column(col =>
                {
                    col.Item().Text("Smart Clinic - Clinical Visits Report").FontSize(20).SemiBold();
                    col.Item().Text($"Period: {data.Period.From} to {data.Period.To}").FontSize(10).Italic();
                });
                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns => { columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); });
                    table.Header(header => { header.Cell().Text("Date"); header.Cell().Text("Doctor"); header.Cell().Text("Patient"); header.Cell().Text("Signed"); });
                    foreach (var item in data.Records) { table.Cell().Text(item.CreatedAt.ToShortDateString()); table.Cell().Text(item.DoctorName); table.Cell().Text(item.PatientName); table.Cell().Text(item.IsSigned ? "Yes" : "No"); }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateDoctorsReport(DoctorsReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Column(col =>
                {
                    col.Item().Text("Smart Clinic - Doctors Directory").FontSize(20).SemiBold();
                    col.Item().Text($"As of: {DateTime.UtcNow:yyyy-MM-dd}").FontSize(10).Italic();
                });
                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns => { columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); });
                    table.Header(header => { header.Cell().Text("Name"); header.Cell().Text("Specialization"); header.Cell().Text("Status"); });
                    foreach (var item in data.Records) { table.Cell().Text($"{item.FirstName} {item.LastName}"); table.Cell().Text(item.Specialization); table.Cell().Text(item.IsActive ? "Active" : "Inactive"); }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GeneratePatientsReport(PatientsReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Column(col =>
                {
                    col.Item().Text("Smart Clinic - Patients Demographic Report").FontSize(20).SemiBold();
                    col.Item().Text($"As of: {DateTime.UtcNow:yyyy-MM-dd}").FontSize(10).Italic();
                });
                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns => { columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); });
                    table.Header(header => { header.Cell().Text("Name"); header.Cell().Text("Gender"); header.Cell().Text("Joined"); });
                    foreach (var item in data.Records) { table.Cell().Text($"{item.FirstName} {item.LastName}"); table.Cell().Text(item.Gender); table.Cell().Text(item.CreatedAt.ToShortDateString()); }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateAuditLogReport(IEnumerable<AuditLog> data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.Header().Text("Smart Clinic - System Audit Log").FontSize(20).SemiBold();
                page.Content().PaddingVertical(1, Unit.Centimetre).Table(table =>
                {
                    table.ColumnsDefinition(columns => { columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); columns.RelativeColumn(); });
                    table.Header(header => { header.Cell().Text("Time"); header.Cell().Text("Actor"); header.Cell().Text("Service"); header.Cell().Text("Action"); });
                    foreach (var item in data) { table.Cell().Text(item.OccurredAt.ToString("g")); table.Cell().Text(item.ActorId); table.Cell().Text(item.Service); table.Cell().Text(item.Action); }
                });
            });
        }).GeneratePdf();
    }

    public byte[] GenerateSummaryReport(SummaryReportResponse data)
    {
        return Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(1, Unit.Centimetre);
                page.DefaultTextStyle(x => x.FontSize(10).FontFamily(Fonts.Verdana));

                page.Header().Column(col =>
                {
                    col.Item().Text("Smart Clinic - Comprehensive Summary Report").FontSize(22).SemiBold().FontColor(Colors.Blue.Medium);
                    col.Item().Text($"Period: {data.Period.From} to {data.Period.To}").FontSize(12).Italic();
                });

                page.Content().PaddingVertical(1, Unit.Centimetre).Column(x =>
                {
                    x.Spacing(20);

                    // 1. Appointments Section
                    x.Item().Column(sec =>
                    {
                        sec.Item().Text("1. Appointments Overview").FontSize(14).SemiBold().Underline();
                        sec.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total: {data.Appointments.TotalAppointments}");
                            row.RelativeItem().Text($"Completed: {data.Appointments.Completed}");
                            row.RelativeItem().Text($"Cancelled: {data.Appointments.Cancelled}");
                        });
                    });

                    // 2. Revenue Section
                    x.Item().Column(sec =>
                    {
                        sec.Item().Text("2. Revenue Summary").FontSize(14).SemiBold().Underline();
                        sec.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Billed: ${data.Revenue.TotalBilled:N2}");
                            row.RelativeItem().Text($"Total Collected: ${data.Revenue.TotalCollected:N2}");
                            row.RelativeItem().Text($"Pending: ${data.Revenue.Pending:N2}");
                        });
                    });

                    // 3. Clinical Section
                    x.Item().Column(sec =>
                    {
                        sec.Item().Text("3. Clinical Visits").FontSize(14).SemiBold().Underline();
                        sec.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Visits: {data.Visits.TotalVisits}");
                            row.RelativeItem().Text($"Signed: {data.Visits.SignedVisits}");
                            row.RelativeItem().Text($"Unsigned: {data.Visits.UnsignedVisits}");
                        });
                    });

                    // 4. Staff & Patients
                    x.Item().Column(sec =>
                    {
                        sec.Item().Text("4. Staff & Patients Demographics").FontSize(14).SemiBold().Underline();
                        sec.Item().Row(row =>
                        {
                            row.RelativeItem().Text($"Total Doctors: {data.Doctors.TotalDoctors} ({data.Doctors.ActiveDoctors} Active)");
                            row.RelativeItem().Text($"Total Patients: {data.Patients.TotalPatients}");
                        });
                    });
                    
                    x.Item().PaddingTop(20).Text("Note: Detailed records are available in individual reports.").Italic().FontSize(9).FontColor(Colors.Grey.Medium);
                });

                page.Footer().AlignCenter().Text(x =>
                {
                    x.Span("Page ");
                    x.CurrentPageNumber();
                });
            });
        }).GeneratePdf();
    }
}
