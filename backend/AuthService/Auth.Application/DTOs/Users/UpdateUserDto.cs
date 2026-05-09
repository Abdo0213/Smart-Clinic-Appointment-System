using System.ComponentModel.DataAnnotations;

namespace Auth.Application.DTOs.Users
{
    public class UpdateUserDto
    {
        [EmailAddress]
        public string? Email { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? Specialization { get; set; }
        public string? Password { get; set; }
    }
}