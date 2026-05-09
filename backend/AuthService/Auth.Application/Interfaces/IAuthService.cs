using Auth.Application.DTOs.Auth;
using Auth.Domain.Entities;
using Microsoft.AspNetCore.Identity;

namespace Auth.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(IdentityResult Result, string? UserId)> RegisterAsync(RegisterDto model);
        Task<(AuthResponseDto? Response, string? Error)> LoginAsync(LoginDto model);
        Task<(AuthResponseDto? Response, string? Error)> RefreshTokenAsync(string token, string refreshToken);
        Task<bool> LogoutAsync(string userId);
        Task<object?> GetProfileAsync(string userId);
        Task<(bool Success, string? Error)> UpdateProfileAsync(string userId, UpdateProfileDto model);
        Task<(bool Success, string? Error)> ChangePasswordAsync(string userId, ChangePasswordDto model);
    }

    public class UpdateProfileDto
    {
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Email { get; set; }
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!;
        public object? Profile { get; set; }
    }
}
