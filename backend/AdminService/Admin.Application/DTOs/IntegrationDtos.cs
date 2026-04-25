namespace Admin.Application.DTOs;

public class AppointmentDto
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
    public string DoctorId { get; set; } = string.Empty;
}

public class InvoiceDto
{
    public string Id { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty; 
    public decimal TotalAmount { get; set; }
}
