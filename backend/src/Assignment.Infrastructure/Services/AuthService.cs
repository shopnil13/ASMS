using Assignment.Application.DTOs;
using Assignment.Application.Interfaces;
using Assignment.Infrastructure.Data;
using Assignment.Domain.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Configuration;

namespace Assignment.Infrastructure.Services;

public class AuthService : IAuthService
{
private readonly ApplicationDbContext _context;
private readonly PasswordHasher<User> _passwordHasher;
private readonly IConfiguration _configuration;

    public AuthService(ApplicationDbContext context, IConfiguration configuration)
    {
        _context = context;
        _passwordHasher = new PasswordHasher<User>();
        _configuration = configuration;
    }

    public async Task<RegisterResponse> RegisterAsync(RegisterRequest request)
    {
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
        {
            throw new InvalidOperationException("A user with this email already exists.");
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Role = Assignment.Domain.Enums.UserRole.Student,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password
        );

        _context.Users.Add(user);

        await _context.SaveChangesAsync();

        return new RegisterResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString()
        };
    }

    public async Task<LoginResponse> LoginAsync(LoginRequest request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        var passwordResult = _passwordHasher.VerifyHashedPassword(
            user,
            user.PasswordHash,
            request.Password
        );

        if (passwordResult == PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException("Invalid email or password.");
        }

        return new LoginResponse
        {
            UserId = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            Token = GenerateJwtToken(user)
        };
    }

    private string GenerateJwtToken(User user)
{
    var key = _configuration["Jwt:Key"]
        ?? throw new InvalidOperationException("JWT key is not configured.");

    var issuer = _configuration["Jwt:Issuer"]
        ?? throw new InvalidOperationException("JWT issuer is not configured.");

    var audience = _configuration["Jwt:Audience"]
        ?? throw new InvalidOperationException("JWT audience is not configured.");

    var expirationMinutes = int.Parse(
        _configuration["Jwt:ExpirationMinutes"] ?? "60"
    );

    var claims = new List<Claim>
    {
        new(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
        new(JwtRegisteredClaimNames.Email, user.Email),
        new(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
        new(ClaimTypes.Role, user.Role.ToString())
    };

    var signingKey = new SymmetricSecurityKey(
        Encoding.UTF8.GetBytes(key)
    );

    var credentials = new SigningCredentials(
        signingKey,
        SecurityAlgorithms.HmacSha256
    );

    var token = new JwtSecurityToken(
        issuer: issuer,
        audience: audience,
        claims: claims,
        expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
        signingCredentials: credentials
    );

    return new JwtSecurityTokenHandler().WriteToken(token);
}




}