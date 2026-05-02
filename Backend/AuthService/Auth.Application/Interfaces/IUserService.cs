using Auth.Application.DTOs.Users;
using Microsoft.AspNetCore.Identity;

namespace Auth.Application.Interfaces
{
    public interface IUserService
    {
        Task<IReadOnlyList<UserDto>> GetUsersAsync();
        Task<UserDto?> GetUserAsync(string id);
        Task<(UserDto? User, IEnumerable<IdentityError> Errors)> CreateUserAsync(CreateUserDto model);
        Task<(UserDto? User, IEnumerable<IdentityError> Errors)> UpdateUserAsync(string id, UpdateUserDto model);
        Task<bool> DeleteUserAsync(string id);
    }
}