using Auth.Application.DTOs.Auth;
using Auth.Application.Interfaces;
using Auth.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Json;

namespace Auth.Application.Services
{
    public class AuthService : IAuthService
    {
        private const string PatientRole = "Patient";
        private const string DoctorRole = "Doctor";

        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly IHttpClientFactory _httpClientFactory;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            IConfiguration configuration,
            IHttpClientFactory httpClientFactory)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _configuration = configuration;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<(IdentityResult Result, string? UserId)> RegisterAsync(RegisterDto model)
        {
            if (!await _roleManager.RoleExistsAsync(PatientRole))
            {
                return (IdentityResult.Failed(new IdentityError
                {
                    Description = $"Role '{PatientRole}' is not configured."
                }), null);
            }

            var user = new ApplicationUser 
            { 
                UserName = model.Email, 
                Email = model.Email,
                FirstName = model.FirstName,
                LastName = model.LastName
            };
            var result = await _userManager.CreateAsync(user, model.Password);

            if (result.Succeeded)
            {
                var roleResult = await _userManager.AddToRoleAsync(user, PatientRole);
                if (!roleResult.Succeeded)
                {
                    return (roleResult, null);
                }
                return (result, user.Id);
            }

            return (result, null);
        }

        public async Task<(AuthResponseDto? Response, string? Error)> LoginAsync(LoginDto model)
        {
            var user = await _userManager.FindByEmailAsync(model.Email);
            if (user == null || !await _userManager.CheckPasswordAsync(user, model.Password))
                return (null, "Invalid email or password.");

            var userRoles = await _userManager.GetRolesAsync(user);
            var token = GenerateToken(user, userRoles);
            var refreshToken = GenerateRefreshToken();

            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiryTime = DateTime.UtcNow.AddDays(7);
            await _userManager.UpdateAsync(user);

            var profile = await GetProfileAsync(user.Id);
            return (new AuthResponseDto { Token = token, RefreshToken = refreshToken, Profile = profile }, null);
        }

        public async Task<(AuthResponseDto? Response, string? Error)> RefreshTokenAsync(string token, string refreshToken)
        {
            var principal = GetPrincipalFromExpiredToken(token);
            if (principal == null)
                return (null, "Invalid access token or refresh token.");

            string email = principal.Claims.First(c => c.Type == ClaimTypes.Email).Value;
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiryTime <= DateTime.UtcNow)
                return (null, "Invalid access token or refresh token.");

            var newAccessToken = GenerateToken(user, await _userManager.GetRolesAsync(user));
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            await _userManager.UpdateAsync(user);

            var profile = await GetProfileAsync(user.Id);
            return (new AuthResponseDto { Token = newAccessToken, RefreshToken = newRefreshToken, Profile = profile }, null);
        }

        public async Task<bool> LogoutAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return false;

            user.RefreshToken = null;
            await _userManager.UpdateAsync(user);
            return true;
        }

        public async Task<object?> GetProfileAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return null;

            var roles = await _userManager.GetRolesAsync(user);
            var role = roles.FirstOrDefault() ?? "User";

            var profile = new
            {
                id = user.Id,
                email = user.Email,
                firstName = user.FirstName,
                lastName = user.LastName,
                role = role,
                patientId = (string?)null,
                doctorId = (string?)null
            };

            // In a real microservices environment, we'd query Patient/Doctor service
            if (role == PatientRole)
            {
                try
                {
                    var patientServiceUrl = _configuration["Services:PatientService"] ?? "http://localhost:8083";
                    var client = _httpClientFactory.CreateClient();
                    var response = await client.GetAsync($"{patientServiceUrl}/patients/user/{userId}");
                    if (response.IsSuccessStatusCode)
                    {
                        var patientData = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>();
                        if (patientData != null && patientData.TryGetValue("id", out var idElement))
                        {
                            return new
                            {
                                profile.id,
                                profile.email,
                                profile.firstName,
                                profile.lastName,
                                profile.role,
                                patientId = idElement.GetString(),
                                patientData // include full patient data
                            };
                        }
                    }
                }
                catch { /* Ignore errors for now */ }
            }
            else if (role == DoctorRole)
            {
                try
                {
                    var doctorServiceUrl = _configuration["Services:DoctorService"] ?? "http://localhost:8082";
                    var client = _httpClientFactory.CreateClient();
                    var response = await client.GetAsync($"{doctorServiceUrl}/doctors/user/{userId}");
                    if (response.IsSuccessStatusCode)
                    {
                        var doctorData = await response.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>();
                        if (doctorData != null && doctorData.TryGetValue("id", out var idElement))
                        {
                            return new
                            {
                                profile.id,
                                profile.email,
                                profile.firstName,
                                profile.lastName,
                                profile.role,
                                doctorId = idElement.GetString(),
                                doctorData // include full doctor data
                            };
                        }
                    }
                }
                catch { /* Ignore errors for now */ }
            }

            return profile;
        }

        public async Task<(bool Success, string? Error)> UpdateProfileAsync(string userId, UpdateProfileDto model)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) return (false, "User not found");

            bool nameChanged = false;
            if (!string.IsNullOrEmpty(model.FirstName) && user.FirstName != model.FirstName)
            {
                user.FirstName = model.FirstName;
                nameChanged = true;
            }
            if (!string.IsNullOrEmpty(model.LastName) && user.LastName != model.LastName)
            {
                user.LastName = model.LastName;
                nameChanged = true;
            }

            if (nameChanged)
            {
                var result = await _userManager.UpdateAsync(user);
                if (!result.Succeeded) return (false, string.Join(", ", result.Errors.Select(e => e.Description)));

                // Sync names with other services
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault();
                var client = _httpClientFactory.CreateClient();

                if (role == PatientRole)
                {
                    try
                    {
                        var patientServiceUrl = _configuration["Services:PatientService"] ?? "http://localhost:8083";
                        // Get patient ID first
                        var getResponse = await client.GetAsync($"{patientServiceUrl}/patients/user/{userId}");
                        if (getResponse.IsSuccessStatusCode)
                        {
                            var patientData = await getResponse.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>();
                            if (patientData != null && patientData.TryGetValue("id", out var idElement))
                            {
                                string patientId = idElement.GetString() ?? "";
                                // Update patient names
                                await client.PutAsJsonAsync($"{patientServiceUrl}/patients/{patientId}", new
                                {
                                    firstName = user.FirstName,
                                    lastName = user.LastName
                                });
                            }
                        }
                    }
                    catch { /* Log error */ }
                }
                else if (role == DoctorRole)
                {
                    try
                    {
                        var doctorServiceUrl = _configuration["Services:DoctorService"] ?? "http://localhost:8082";
                        var getResponse = await client.GetAsync($"{doctorServiceUrl}/doctors/user/{userId}");
                        if (getResponse.IsSuccessStatusCode)
                        {
                            var doctorData = await getResponse.Content.ReadFromJsonAsync<Dictionary<string, JsonElement>>();
                            if (doctorData != null && doctorData.TryGetValue("id", out var idElement))
                            {
                                string doctorId = idElement.GetString() ?? "";
                                string specialization = doctorData.TryGetValue("specialization", out var specElement) ? specElement.GetString() ?? "" : "";
                                
                                await client.PutAsJsonAsync($"{doctorServiceUrl}/doctors/{doctorId}", new
                                {
                                    firstName = user.FirstName,
                                    lastName = user.LastName,
                                    specialization = specialization
                                });
                            }
                        }
                    }
                    catch { /* Log error */ }
                }
            }

            return (true, null);
        }

        private string GenerateToken(ApplicationUser user, IEnumerable<string> userRoles)
        {
            var claims = new List<Claim>
            {
                new(JwtRegisteredClaimNames.Sub, user.Email!),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new(ClaimTypes.NameIdentifier, user.Id),
                new(ClaimTypes.Email, user.Email!)
            };

            claims.AddRange(userRoles.Select(role => new Claim(ClaimTypes.Role, role)));

            var key = _configuration["Jwt:Key"]!;
            var issuer = _configuration["Jwt:Issuer"]!;
            var audience = _configuration["Jwt:Audience"]!;

            var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key));
            var creds = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(15), // Shorter expiry for rotating tokens
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        private ClaimsPrincipal? GetPrincipalFromExpiredToken(string? token)
        {
            var tokenValidationParameters = new TokenValidationParameters
            {
                ValidateAudience = false,
                ValidateIssuer = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!)),
                ValidateLifetime = false
            };

            var tokenHandler = new JwtSecurityTokenHandler();
            var principal = tokenHandler.ValidateToken(token, tokenValidationParameters, out SecurityToken securityToken);
            if (securityToken is not JwtSecurityToken jwtSecurityToken || !jwtSecurityToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
                throw new SecurityTokenException("Invalid token");

            return principal;
        }
    }
}
