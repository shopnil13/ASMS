using Assignment.Application.DTOs.Admin;

namespace Assignment.Application.Interfaces;

public interface IAdminUserService
{
    Task<List<AdminUserResponse>> GetUsersAsync();

    Task<AdminUserResponse?> GetUserByIdAsync(Guid id);

    Task<AdminUserResponse> CreateUserAsync(CreateUserRequest request);

    Task<AdminUserResponse?> UpdateUserRoleAsync(
        Guid id,
        UpdateUserRoleRequest request);

    Task<DeleteUserResult> DeleteUserAsync(
        Guid id,
        Guid currentAdminId);
}

