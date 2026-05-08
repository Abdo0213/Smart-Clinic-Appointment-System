using Auth.Application.DTOs.Common;
using Auth.Application.DTOs.Users;
using Microsoft.AspNetCore.Identity;

namespace Auth.Application.Interfaces
{
    public interface IUserService
    {
        Task<PaginatedResponse<UserDto>> GetUsersAsync(int page = 0, int size = 10, string? search = null);
        Task<UserDto?> GetUserAsync(string id);
        Task<(UserDto? User, IEnumerable<IdentityError> Errors)> CreateUserAsync(CreateUserDto model);
        Task<(UserDto? User, IEnumerable<IdentityError> Errors)> UpdateUserAsync(string id, UpdateUserDto model);
        Task<bool> DeleteUserAsync(string id);
    }
}