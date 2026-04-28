namespace Admin.Application.DTOs;

public class AppointmentDto
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
    public string DoctorId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class InvoiceDto
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class VisitDto
{
    public string Id { get; set; } = string.Empty;
    public string DoctorId { get; set; } = string.Empty;
    public string PatientId { get; set; } = string.Empty;
    public bool IsSigned { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class DoctorDto
{
    public string Id { get; set; } = string.Empty;
    public string Specialization { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class PatientDto
{
    public string Id { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
