using Auth.Application.DTOs.Auth;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;
using System.Security.Claims;

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
                    Console.WriteLine($"Failed to create patient record: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Exception when calling Patient Service: {ex.Message}");
            }

            // Auto-login after registration
            var (authResponse, loginError) = await _authService.LoginAsync(new LoginDto 
            { 
                Email = model.Email, 
                Password = model.Password 
            });

            if (authResponse != null)
            {
                return Ok(authResponse);
            }

            return Ok(new { message = "User registered and patient profile created successfully!", userId = userId });
        }

        return BadRequest(result.Errors);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto model)
    {
        var (response, error) = await _authService.LoginAsync(model);
        if (response != null)
            return Ok(response);

        return Unauthorized(new { message = error });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] AuthResponseDto model)
    {
        var (response, error) = await _authService.RefreshTokenAsync(model.Token, model.RefreshToken);
        if (response != null)
            return Ok(response);

        return BadRequest(new { message = error });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var success = await _authService.LogoutAsync(userId);
        return success ? NoContent() : BadRequest();
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var profile = await _authService.GetProfileAsync(userId);
        if (profile == null) return NotFound();

        return Ok(profile);
    }

    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, error) = await _authService.UpdateProfileAsync(userId, model);
        if (!success) return BadRequest(new { message = error });

        var profile = await _authService.GetProfileAsync(userId);
        return Ok(profile);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto model)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (userId == null) return Unauthorized();

        var (success, error) = await _authService.ChangePasswordAsync(userId, model);
        if (!success) return BadRequest(new { message = error });

        return Ok(new { message = "Password changed successfully" });
    }
}