using System.ComponentModel.DataAnnotations;

namespace Auth.Application.DTOs.Users
{
    public class CreateUserDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = null!;

        [Required]
        [MinLength(8)]
        public string Password { get; set; } = null!;

        [Required]
        [RegularExpression("(?i)^(Admin|Doctor|Patient|Receptionist)$", ErrorMessage = "Invalid role.")]
        public string Role { get; set; } = null!;

        public string? FirstName { get; set; }
        
        public string? LastName { get; set; }
        
        public string? Specialization { get; set; }
    }
}