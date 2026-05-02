using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace Auth.Infrastructure.Data
{
    public class AppDbContext : IdentityDbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options)
            : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            // Seed Roles
            var roles = new[]
            {
                new IdentityRole { Id = "1", Name = "Admin", NormalizedName = "ADMIN", ConcurrencyStamp = "1" },
                new IdentityRole { Id = "2", Name = "Doctor", NormalizedName = "DOCTOR", ConcurrencyStamp = "2" },
                new IdentityRole { Id = "3", Name = "Patient", NormalizedName = "PATIENT", ConcurrencyStamp = "3" },
                new IdentityRole { Id = "4", Name = "Receptionist", NormalizedName = "RECEPTIONIST", ConcurrencyStamp = "4" }
            };

            builder.Entity<IdentityRole>().HasData(roles);
        }
    }
}
