using Auth.Application.DTOs.Users;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http.Json;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/users")]
[Authorize(Roles = "Admin")]  // Only admins can manage users
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
    public async Task<ActionResult<IReadOnlyList<UserDto>>> GetUsers()
    {
        var users = await _userService.GetUsersAsync();
        return Ok(users);
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
            return BadRequest(errors);

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

        return CreatedAtAction(nameof(GetUser), new { id = user.Id }, user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> UpdateUser(string id, [FromBody] UpdateUserDto model)
    {
        var (user, errors) = await _userService.UpdateUserAsync(id, model);
        if (user == null)
            return errors.Any() ? BadRequest(errors) : NotFound();

        return Ok(user);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteUser(string id)
    {
        var success = await _userService.DeleteUserAsync(id);
        return success ? NoContent() : NotFound();
    }
}
