using System.Text.Json.Serialization;

namespace Admin.Application.DTOs;

public class AppointmentDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; 
    [JsonPropertyName("doctorId")]
    public string DoctorId { get; set; } = string.Empty;
    [JsonPropertyName("patientId")]
    public string PatientId { get; set; } = string.Empty;
    [JsonPropertyName("doctorName")]
    public string DoctorName { get; set; } = string.Empty;
    [JsonPropertyName("patientName")]
    public string PatientName { get; set; } = string.Empty;
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
    [JsonPropertyName("slotDate")]
    public DateTime SlotDate { get; set; }
}

public class InvoiceDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("status")]
    public string Status { get; set; } = string.Empty; 
    [JsonPropertyName("totalAmount")]
    public decimal TotalAmount { get; set; }
    [JsonPropertyName("patientId")]
    public string PatientId { get; set; } = string.Empty;
    [JsonPropertyName("patientName")]
    public string PatientName { get; set; } = string.Empty;
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}

public class VisitDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("doctorId")]
    public string DoctorId { get; set; } = string.Empty;
    [JsonPropertyName("patientId")]
    public string PatientId { get; set; } = string.Empty;
    [JsonPropertyName("doctorName")]
    public string DoctorName { get; set; } = string.Empty;
    [JsonPropertyName("patientName")]
    public string PatientName { get; set; } = string.Empty;
    [JsonPropertyName("isSigned")]
    public bool IsSigned { get; set; }
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}

public class DoctorDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("userId")]
    public string UserId { get; set; } = string.Empty;
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;
    [JsonPropertyName("specialization")]
    public string Specialization { get; set; } = string.Empty;
    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}

public class PatientDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("firstName")]
    public string FirstName { get; set; } = string.Empty;
    [JsonPropertyName("lastName")]
    public string LastName { get; set; } = string.Empty;
    [JsonPropertyName("gender")]
    public string Gender { get; set; } = string.Empty;
    [JsonPropertyName("createdAt")]
    public DateTime CreatedAt { get; set; }
}

public class ApiResponse<T>
{
    public T? Content { get; set; }
    public bool IsSuccess { get; set; }
    public string? ErrorMessage { get; set; }
}

public class UserDto
{
    [JsonPropertyName("id")]
    public string Id { get; set; } = string.Empty;
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("userName")]
    public string UserName { get; set; } = string.Empty;
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;
    [JsonPropertyName("firstName")]
    public string? FirstName { get; set; }
    [JsonPropertyName("lastName")]
    public string? LastName { get; set; }
    [JsonPropertyName("isActive")]
    public bool? IsActive { get; set; }
}

public class UpdateUserDto
{
    public string? Email { get; set; }
    public string? FirstName { get; set; }
    public string? LastName { get; set; }
    public string? Specialization { get; set; }
    public string? Password { get; set; }
}
