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
        [RegularExpression("(?i)^(Doctor|Receptionist)$", ErrorMessage = "Role must be Doctor or Receptionist.")]
        public string Role { get; set; } = null!;
    }
}