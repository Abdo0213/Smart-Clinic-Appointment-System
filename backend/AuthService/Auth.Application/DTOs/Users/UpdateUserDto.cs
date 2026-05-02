using System.ComponentModel.DataAnnotations;

namespace Auth.Application.DTOs.Users
{
    public class UpdateUserDto
    {
        [EmailAddress]
        public string? Email { get; set; }
    }
}