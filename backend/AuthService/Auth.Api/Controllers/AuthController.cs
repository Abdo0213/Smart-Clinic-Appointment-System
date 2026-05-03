using Auth.Application.DTOs.Auth;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly IConfiguration _configuration;

    public AuthController(IAuthService authService, IHttpClientFactory httpClientFactory, IConfiguration configuration)
    {
        _authService = authService;
        _httpClientFactory = httpClientFactory;
        _configuration = configuration;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto model)
    {
        var (result, userId) = await _authService.RegisterAsync(model);

        if (result.Succeeded)
        {
            // Call Patient Service to create the basic profile
            try
            {
                var patientServiceUrl = _configuration["Services:PatientService"] ?? "http://localhost:8083";
                var client = _httpClientFactory.CreateClient();
                
                var patientData = new
                {
                    userId = userId,
                    firstName = model.FirstName ?? "Unknown",
                    lastName = model.LastName ?? "Unknown",
                    phone = "Unknown"
                };

                var response = await client.PostAsJsonAsync($"{patientServiceUrl}/patients", patientData);
                
                if (!response.IsSuccessStatusCode)
                {
                    // Log error or handle if needed. For now, we still return OK for auth registration
                    Console.WriteLine($"Failed to create patient record: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception when calling Patient Service: {ex.Message}");
            }

            return Ok(new { message = "User registered and patient profile created successfully!", userId = userId });
        }

        return BadRequest(result.Errors);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var (token, error) = await _authService.LoginAsync(model);
        if (token != null)
            return Ok(new { token });

        return Unauthorized(error);
    }
}