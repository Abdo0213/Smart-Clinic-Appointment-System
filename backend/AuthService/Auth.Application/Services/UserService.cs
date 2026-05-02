using Auth.Application.DTOs.Users;
using Auth.Application.Interfaces;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Auth.Application.Services
{
    public class UserService : IUserService
    {
        private static readonly HashSet<string> AllowedStaffRoles =
            new(StringComparer.OrdinalIgnoreCase) { "Doctor", "Receptionist" };

        private readonly UserManager<IdentityUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(UserManager<IdentityUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<IReadOnlyList<UserDto>> GetUsersAsync()
        {
            var users = new List<UserDto>();

            foreach (var user in _userManager.Users.AsNoTracking().ToList())
            {
                var roles = await _userManager.GetRolesAsync(user);
                users.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    Role = roles.FirstOrDefault() ?? string.Empty
                });
            }

            return users.AsReadOnly();
        }

        public async Task<UserDto?> GetUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            return user == null ? null : await ToDtoAsync(user);
        }

        public async Task<(UserDto? User, IEnumerable<IdentityError> Errors)> CreateUserAsync(CreateUserDto model)
        {
            var role = model.Role.Trim();
            if (!AllowedStaffRoles.Contains(role))
            {
                return (null, new[]
                {
                    new IdentityError { Description = "Role must be Doctor or Receptionist." }
                });
            }

            if (!await _roleManager.RoleExistsAsync(role))
            {
                return (null, new[]
                {
                    new IdentityError { Description = $"Role '{role}' is not configured." }
                });
            }

            var user = new IdentityUser { UserName = model.Email, Email = model.Email };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (!result.Succeeded)
            {
                return (null, result.Errors);
            }

            var roleResult = await _userManager.AddToRoleAsync(user, role);
            if (!roleResult.Succeeded)
            {
                return (null, roleResult.Errors);
            }

            return (await ToDtoAsync(user), Array.Empty<IdentityError>());
        }

        public async Task<(UserDto? User, IEnumerable<IdentityError> Errors)> UpdateUserAsync(string id, UpdateUserDto model)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return (null, Array.Empty<IdentityError>());
            }

            if (model.Email is not null)
            {
                var emailResult = await _userManager.SetEmailAsync(user, model.Email);
                if (!emailResult.Succeeded)
                {
                    return (null, emailResult.Errors);
                }

                var userNameResult = await _userManager.SetUserNameAsync(user, model.Email);
                if (!userNameResult.Succeeded)
                {
                    return (null, userNameResult.Errors);
                }
            }

            return (await ToDtoAsync(user), Array.Empty<IdentityError>());
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return false;

            var result = await _userManager.DeleteAsync(user);
            return result.Succeeded;
        }

        private async Task<UserDto> ToDtoAsync(IdentityUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                Role = roles.FirstOrDefault() ?? string.Empty
            };
        }
    }
}