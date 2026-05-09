using Auth.Application.DTOs.Common;
using Auth.Application.DTOs.Users;
using Auth.Application.Interfaces;
using Auth.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Auth.Application.Services
{
    public class UserService : IUserService
    {
        private static readonly HashSet<string> AllowedStaffRoles =
            new(StringComparer.OrdinalIgnoreCase) { "Admin", "Doctor", "Patient", "Receptionist" };

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;

        public UserService(UserManager<ApplicationUser> userManager, RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _roleManager = roleManager;
        }

        public async Task<PaginatedResponse<UserDto>> GetUsersAsync(int page = 0, int size = 10, string? search = null)
        {
            var query = _userManager.Users.AsNoTracking();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var lowerSearch = search.ToLower();
                query = query.Where(u => 
                    (u.Email != null && u.Email.ToLower().Contains(lowerSearch)) ||
                    (u.FirstName != null && u.FirstName.ToLower().Contains(lowerSearch)) ||
                    (u.LastName != null && u.LastName.ToLower().Contains(lowerSearch)) ||
                    (u.UserName != null && u.UserName.ToLower().Contains(lowerSearch)));
            }

            var totalElements = await query.CountAsync();
            var dbUsers = await query
                .Skip(page * size)
                .Take(size)
                .ToListAsync();

            var userDtos = new List<UserDto>();
            foreach (var user in dbUsers)
            {
                var roles = await _userManager.GetRolesAsync(user);
                userDtos.Add(new UserDto
                {
                    Id = user.Id,
                    Email = user.Email ?? string.Empty,
                    UserName = user.UserName ?? string.Empty,
                    Role = roles.FirstOrDefault() ?? string.Empty,
                    FirstName = user.FirstName,
                    LastName = user.LastName
                });
            }

            return new PaginatedResponse<UserDto>
            {
                Content = userDtos,
                Page = page,
                Size = size,
                TotalElements = totalElements,
                TotalPages = (int)Math.Ceiling(totalElements / (double)size)
            };
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
                    new IdentityError { Description = "Invalid role specified." }
                });
            }

            if (!await _roleManager.RoleExistsAsync(role))
            {
                return (null, new[]
                {
                    new IdentityError { Description = $"Role '{role}' is not configured." }
                });
            }

            var user = new ApplicationUser 
            { 
                UserName = model.Email, 
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };
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

            if (model.FirstName is not null)
            {
                user.FirstName = model.FirstName;
            }

            if (model.LastName is not null)
            {
                user.LastName = model.LastName;
            }

            if (model.FirstName is not null || model.LastName is not null)
            {
                var updateResult = await _userManager.UpdateAsync(user);
                if (!updateResult.Succeeded)
                {
                    return (null, updateResult.Errors);
                }
            }

            if (!string.IsNullOrWhiteSpace(model.Password))
            {
                // Simple reset for admin use
                await _userManager.RemovePasswordAsync(user);
                var addResult = await _userManager.AddPasswordAsync(user, model.Password);
                if (!addResult.Succeeded)
                {
                    return (null, addResult.Errors);
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

        private async Task<UserDto> ToDtoAsync(ApplicationUser user)
        {
            var roles = await _userManager.GetRolesAsync(user);
            return new UserDto
            {
                Id = user.Id,
                Email = user.Email ?? string.Empty,
                UserName = user.UserName ?? string.Empty,
                Role = roles.FirstOrDefault() ?? string.Empty,
                FirstName = user.FirstName,
                LastName = user.LastName
            };
        }
    }
}