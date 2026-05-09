using Auth.Application.DTOs.Common;
using Auth.Application.DTOs.Users;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/users")]
// [Authorize(Roles = "Admin")]  // Only admins can manage users
public class UserController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public UserController(IUserService userService, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _userService = userService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [HttpGet]
    public async Task<ActionResult<PaginatedResponse<UserDto>>> GetUsers([FromQuery] int page = 0, [FromQuery] int size = 10, [FromQuery] string? search = null)
    {
        var result = await _userService.GetUsersAsync(page, size, search);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetUser(string id)
    {
        var user = await _userService.GetUserAsync(id);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPost]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto model)
    {
        var (user, errors) = await _userService.CreateUserAsync(model);
        if (user == null)
        {
            var firstError = errors.FirstOrDefault()?.Description ?? "Failed to create user";
            return BadRequest(new { message = firstError, errors = errors });
        }

        if (model.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var doctorServiceUrl = _configuration["Services:DoctorService"] ?? "http://localhost:8082";
                var client = _httpClientFactory.CreateClient();
                
                var doctorData = new
                {
                    userId = user.Id,
                    firstName = string.IsNullOrWhiteSpace(model.FirstName) ? "Doctor" : model.FirstName,
                    lastName = string.IsNullOrWhiteSpace(model.LastName) ? "Unknown" : model.LastName,
                    specialization = string.IsNullOrWhiteSpace(model.Specialization) ? "General Practice" : model.Specialization,
                    bio = "Newly created doctor profile",
                    phone = "Unknown"
                };

                var response = await client.PostAsJsonAsync($"{doctorServiceUrl}/doctors", doctorData);
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Failed to create doctor record: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception when calling Doctor Service: {ex.Message}");
            }
        }
        else if (model.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var patientServiceUrl = _configuration["Services:PatientService"] ?? "http://localhost:8083";
                var client = _httpClientFactory.CreateClient();
                
                var patientData = new
                {
                    userId = user.Id,
                    firstName = string.IsNullOrWhiteSpace(model.FirstName) ? "Patient" : model.FirstName,
                    lastName = string.IsNullOrWhiteSpace(model.LastName) ? "Unknown" : model.LastName,
                    phone = "Unknown"
                };

                var response = await client.PostAsJsonAsync($"{patientServiceUrl}/patients", patientData);
                
                if (!response.IsSuccessStatusCode)
                {
                    Console.WriteLine($"Failed to create patient record: {response.StatusCode} - {await response.Content.ReadAsStringAsync()}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception when calling Patient Service: {ex.Message}");
            }
        }

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UpdateUserDto model)
    {
        var (user, errors) = await _userService.UpdateUserAsync(id, model);
        if (user == null)
            return errors.Any() ? BadRequest(errors) : NotFound();

        // Propagation to Doctor/Patient Services
        if (user.Role.Equals("Doctor", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var doctorServiceUrl = _configuration["Services:DoctorService"] ?? "http://localhost:8082";
                var client = _httpClientFactory.CreateClient();
                
                // 1. Find doctor by userId
                var getResponse = await client.GetAsync($"{doctorServiceUrl}/doctors/user/{id}");
                if (getResponse.IsSuccessStatusCode)
                {
                    var existingDoctor = await getResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
                    string? doctorId = existingDoctor.GetProperty("id").GetString();

                    if (!string.IsNullOrEmpty(doctorId))
                    {
                        // 2. Update doctor record
                        var doctorUpdateData = new
                        {
                            userId = id,
                            firstName = model.FirstName ?? user.FirstName,
                            lastName = model.LastName ?? user.LastName,
                            specialization = model.Specialization ?? (existingDoctor.TryGetProperty("specialization", out var spec) ? spec.GetString() : "General Practice"),
                            bio = existingDoctor.TryGetProperty("bio", out var bio) ? bio.GetString() : "",
                            phone = existingDoctor.TryGetProperty("phone", out var ph) ? ph.GetString() : ""
                        };
                        await client.PutAsJsonAsync($"{doctorServiceUrl}/doctors/{doctorId}", doctorUpdateData);
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"Error propagating to Doctor Service: {ex.Message}"); }
        }
        else if (user.Role.Equals("Patient", StringComparison.OrdinalIgnoreCase))
        {
            try
            {
                var patientServiceUrl = _configuration["Services:PatientService"] ?? "http://localhost:8083";
                var client = _httpClientFactory.CreateClient();

                // 1. Find patient by userId
                var getResponse = await client.GetAsync($"{patientServiceUrl}/patients/user/{id}");
                if (getResponse.IsSuccessStatusCode)
                {
                    var existingPatient = await getResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>();
                    string? patientId = existingPatient.GetProperty("id").GetString();

                    if (!string.IsNullOrEmpty(patientId))
                    {
                        // 2. Update patient record
                        var patientUpdateData = new
                        {
                            userId = id,
                            firstName = model.FirstName ?? user.FirstName,
                            lastName = model.LastName ?? user.LastName,
                            dateOfBirth = existingPatient.TryGetProperty("dateOfBirth", out var dob) ? dob.GetString() : null,
                            gender = existingPatient.TryGetProperty("gender", out var gen) ? gen.GetString() : null,
                            phone = existingPatient.TryGetProperty("phone", out var ph) ? ph.GetString() : null,
                            address = existingPatient.TryGetProperty("address", out var addr) ? addr.GetString() : null
                        };
                        await client.PutAsJsonAsync($"{patientServiceUrl}/patients/{patientId}", patientUpdateData);
                    }
                }
            }
            catch (Exception ex) { Console.WriteLine($"Error propagating to Patient Service: {ex.Message}"); }
        }

        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var success = await _userService.DeleteUserAsync(id);
        return success ? NoContent() : NotFound();
    }
}
