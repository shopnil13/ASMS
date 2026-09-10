using Assignment.Domain.Entities;
using Assignment.Domain.Enums;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace Assignment.Infrastructure.Data;

public static class AdminSeeder
{
    public static async Task SeedAsync(
        ApplicationDbContext dbContext,
        IConfiguration configuration)
    {
        // Do nothing if an admin already exists.
        if (await dbContext.Users.AnyAsync(u => u.Role == UserRole.Admin))
        {
            return;
        }

        var email = configuration["AdminBootstrap:Email"];
        var password = configuration["AdminBootstrap:Password"];
        var firstName = configuration["AdminBootstrap:FirstName"] ?? "System";
        var lastName = configuration["AdminBootstrap:LastName"] ?? "Administrator";

        if (string.IsNullOrWhiteSpace(email) ||
            string.IsNullOrWhiteSpace(password))
        {
            throw new InvalidOperationException(
                "Admin bootstrap credentials are not configured.");
        }

        var admin = new User
        {
            Id = Guid.NewGuid(),
            FirstName = firstName,
            LastName = lastName,
            Email = email,
            Role = UserRole.Admin,
            CreatedAt = DateTime.UtcNow
        };

        var passwordHasher = new PasswordHasher<User>();

        admin.PasswordHash = passwordHasher.HashPassword(
            admin,
            password);

        dbContext.Users.Add(admin);

        await dbContext.SaveChangesAsync();
    }
}