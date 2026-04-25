namespace Admin.Application.DTOs;

public class AppointmentsReportResponse
{
    public PeriodDto Period { get; set; } = new();
    public int TotalAppointments { get; set; }
    public int Completed { get; set; }
    public int Cancelled { get; set; }
    public int NoShow { get; set; }
    public List<DoctorUtilization> ByDoctor { get; set; } = new();
}

public class DoctorUtilization
{
    public string DoctorId { get; set; } = string.Empty;
    public string DoctorName { get; set; } = "Unknown"; // Would require calling Doctor Service to resolve name
    public int Total { get; set; }
    public double UtilizationPercent { get; set; }
}

public class RevenueReportResponse
{
    public PeriodDto Period { get; set; } = new();
    public decimal TotalBilled { get; set; }
    public decimal TotalCollected { get; set; }
    public decimal TotalWaived { get; set; }
    public decimal Pending { get; set; }
}

public class PeriodDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
}
