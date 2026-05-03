using Auth.Application.DTOs.Auth;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace Auth.Application.Interfaces
{
    public interface IAuthService
    {
        Task<(IdentityResult Result, string? UserId)> RegisterAsync(RegisterDto model);
        Task<(string? Token, string? Error)> LoginAsync(LoginDto model);
    }
}
