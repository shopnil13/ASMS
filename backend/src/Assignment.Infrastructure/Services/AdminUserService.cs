using Assignment.Application.DTOs.Admin;
using Assignment.Application.Interfaces;
using Assignment.Domain.Entities;
using Assignment.Domain.Enums;
using Assignment.Infrastructure.Data;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Infrastructure.Services;

public class AdminUserService : IAdminUserService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly PasswordHasher<User> _passwordHasher;

    public AdminUserService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
        _passwordHasher = new PasswordHasher<User>();
    }

    public async Task<List<AdminUserResponse>> GetUsersAsync()
    {
        return await _dbContext.Users
            .AsNoTracking()
            .OrderBy(user => user.CreatedAt)
            .Select(user => MapToResponse(user))
            .ToListAsync();
    }

    public async Task<AdminUserResponse?> GetUserByIdAsync(Guid id)
    {
        return await _dbContext.Users
            .AsNoTracking()
            .Where(user => user.Id == id)
            .Select(user => MapToResponse(user))
            .FirstOrDefaultAsync();
    }

    public async Task<AdminUserResponse> CreateUserAsync(
        CreateUserRequest request)
    {
        var existingUser = await _dbContext.Users
            .AnyAsync(user => user.Email == request.Email);

        if (existingUser)
        {
            throw new InvalidOperationException(
                "A user with this email already exists.");
        }

        var role = ParseRole(request.Role);

        var user = new User
        {
            Id = Guid.NewGuid(),
            FirstName = request.FirstName,
            LastName = request.LastName,
            Email = request.Email,
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        user.PasswordHash = _passwordHasher.HashPassword(
            user,
            request.Password);

        _dbContext.Users.Add(user);

        await _dbContext.SaveChangesAsync();

        return MapToResponse(user);
    }

    public async Task<AdminUserResponse?> UpdateUserRoleAsync(
        Guid id,
        UpdateUserRoleRequest request)
    {
        var user = await _dbContext.Users
            .FirstOrDefaultAsync(user => user.Id == id);

        if (user == null)
        {
            return null;
        }

        user.Role = ParseRole(request.Role);

        await _dbContext.SaveChangesAsync();

        return MapToResponse(user);
    }

    public async Task<DeleteUserResult> DeleteUserAsync(
        Guid id,
        Guid currentAdminId)
    {
        if (id == currentAdminId)
        {
            return DeleteUserResult.CannotDeleteSelf;
        }

        var user = await _dbContext.Users
            .FirstOrDefaultAsync(user => user.Id == id);

        if (user == null)
        {
            return DeleteUserResult.NotFound;
        }

        var hasCourses = await _dbContext.Courses
            .AnyAsync(course => course.TeacherId == id);

        var hasSubmissions = await _dbContext.Submissions
            .AnyAsync(submission => submission.StudentId == id);

        if (hasCourses || hasSubmissions)
        {
            return DeleteUserResult.UserHasDependencies;
        }

        _dbContext.Users.Remove(user);

        await _dbContext.SaveChangesAsync();

        return DeleteUserResult.Deleted;
    }

    private static UserRole ParseRole(string role)
    {
        if (!Enum.TryParse<UserRole>(
                role,
                ignoreCase: true,
                out var parsedRole) ||
            !Enum.IsDefined(parsedRole))
        {
            throw new ArgumentException(
                "Role must be Student, Teacher, or Admin.",
                nameof(role));
        }

        return parsedRole;
    }

    private static AdminUserResponse MapToResponse(User user)
    {
        return new AdminUserResponse
        {
            Id = user.Id,
            FirstName = user.FirstName,
            LastName = user.LastName,
            Email = user.Email,
            Role = user.Role.ToString(),
            CreatedAt = user.CreatedAt
        };
    }
}

