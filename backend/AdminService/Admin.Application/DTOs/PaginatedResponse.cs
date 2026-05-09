using System.Text.Json.Serialization;

namespace Admin.Application.DTOs;

public class PaginatedResponse<T>
{
    [JsonPropertyName("content")]
    public List<T> Content { get; set; } = new();
    [JsonPropertyName("number")]
    public int Page { get; set; }
    [JsonPropertyName("size")]
    public int Size { get; set; }
    [JsonPropertyName("totalElements")]
    public int TotalElements { get; set; }
    [JsonPropertyName("totalPages")]
    public int TotalPages { get; set; }
}
