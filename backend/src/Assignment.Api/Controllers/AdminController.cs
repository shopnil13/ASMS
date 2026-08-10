using Assignment.Application.DTOs.Admin;
using Assignment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment.Api.Controllers;

[ApiController]
[Route("api/[controller]/users")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminUserService _adminUserService;

    public AdminController(IAdminUserService adminUserService)
    {
        _adminUserService = adminUserService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers()
    {
        var users = await _adminUserService.GetUsersAsync();

        return Ok(users);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetUserById(Guid id)
    {
        var user = await _adminUserService.GetUserByIdAsync(id);

        if (user == null)
        {
            return NotFound(new
            {
                message = "User not found."
            });
        }

        return Ok(user);
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser(CreateUserRequest request)
    {
        try
        {
            var user = await _adminUserService.CreateUserAsync(request);

            return CreatedAtAction(
                nameof(GetUserById),
                new { id = user.Id },
                user);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpPut("{id:guid}/role")]
    public async Task<IActionResult> UpdateUserRole(
        Guid id,
        UpdateUserRoleRequest request)
    {
        try
        {
            var user = await _adminUserService.UpdateUserRoleAsync(
                id,
                request);

            if (user == null)
            {
                return NotFound(new
                {
                    message = "User not found."
                });
            }

            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteUser(Guid id)
    {
        var adminId = GetCurrentUserId();

        if (adminId == null)
        {
            return Unauthorized();
        }

        var result = await _adminUserService.DeleteUserAsync(
            id,
            adminId.Value);

        return result switch
        {
            DeleteUserResult.Deleted => NoContent(),
            DeleteUserResult.NotFound => NotFound(new
            {
                message = "User not found."
            }),
            DeleteUserResult.CannotDeleteSelf => BadRequest(new
            {
                message = "Admins cannot delete their own account."
            }),
            DeleteUserResult.UserHasDependencies => Conflict(new
            {
                message = "User cannot be deleted because they are linked to courses or submissions."
            }),
            _ => BadRequest()
        };
    }

    private Guid? GetCurrentUserId()
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return null;
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return null;
        }

        return userId;
    }
}

