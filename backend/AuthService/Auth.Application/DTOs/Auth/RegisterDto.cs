using System.ComponentModel.DataAnnotations;

namespace Auth.Application.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = null!;

        public string? FirstName { get; set; }
        
        public string? LastName { get; set; }
    }
}
