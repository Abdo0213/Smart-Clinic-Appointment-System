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
    public string DoctorName { get; set; } = "Unknown";
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
    public decimal AverageInvoiceAmount { get; set; }
}

public class VisitsReportResponse
{
    public PeriodDto Period { get; set; } = new();
    public int TotalVisits { get; set; }
    public int SignedVisits { get; set; }
    public int UnsignedVisits { get; set; }
}

public class DoctorsReportResponse
{
    public int TotalDoctors { get; set; }
    public int ActiveDoctors { get; set; }
    public List<SpecializationCount> BySpecialization { get; set; } = new();
}

public class PatientsReportResponse
{
    public int TotalPatients { get; set; }
    public List<GenderCount> ByGender { get; set; } = new();
}

public class SpecializationCount
{
    public string Specialization { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class GenderCount
{
    public string Gender { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class PeriodDto
{
    public string From { get; set; } = string.Empty;
    public string To { get; set; } = string.Empty;
}
