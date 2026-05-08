using System.Text.Json.Serialization;

namespace Admin.Application.DTOs;

public class PaginatedResponse<T>
{
    [JsonPropertyName("content")]
    public List<T> Content { get; set; } = new();
    public int Page { get; set; }
    public int Size { get; set; }
    public int TotalElements { get; set; }
    public int TotalPages { get; set; }
}
