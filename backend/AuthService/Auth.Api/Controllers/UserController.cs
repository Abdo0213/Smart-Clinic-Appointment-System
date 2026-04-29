using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Auth.Api.Controllers;

[ApiController]
[Route("api/users")]
public class UserController : ControllerBase
{
    private readonly UserManager<IdentityUser> _userManager;

    public UserController(UserManager<IdentityUser> userManager)
    {
        _userManager = userManager;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _userManager.Users.Select(u => new { u.Id, u.Email, u.UserName }).ToListAsync();
        return Ok(users);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetUser(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        return Ok(new { user.Id, user.Email, user.UserName });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser(string id, [FromBody] UpdateUserDto model)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null) return NotFound();

        user.Email = model.Email ?? user.Email;
        user.UserName = model.Email ?? user.UserName;

        var result = await _userManager.UpdateAsync(user);
        if (result.Succeeded) return Ok(new { user.Id, user.Email, user.UserName });

        return BadRequest(result.Errors);
    }
}

public class UpdateUserDto
{
    public string? Email { get; set; }
}
