using Microsoft.AspNetCore.Identity;
using Auth.Domain.Entities;

var hasher = new PasswordHasher<ApplicationUser>();
var user = new ApplicationUser { UserName = "admin@clinic.com" };
var hash = hasher.HashPassword(user, "Password123!");
Console.WriteLine(hash);
