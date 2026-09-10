using Assignment.Application.DTOs;
using Assignment.Application.DTOs.Admin;

namespace Assignment.Application.Interfaces;

public interface IAdminUserService
{
    Task<PagedResult<AdminUserResponse>> GetUsersAsync(
        string? search,
        int page,
        int pageSize);

    Task<AdminUserResponse?> GetUserByIdAsync(Guid id);

    Task<AdminUserResponse> CreateUserAsync(CreateUserRequest request);

    Task<AdminUserResponse?> UpdateUserRoleAsync(
        Guid id,
        UpdateUserRoleRequest request);

    Task<DeleteUserResult> DeleteUserAsync(
        Guid id,
        Guid currentAdminId);

    Task<bool> ResetPasswordAsync(
        Guid id,
        ResetPasswordRequest request);
}

