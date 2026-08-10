using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Admin;

public class UpdateUserRoleRequest
{
    [Required]
    public string Role { get; set; } = string.Empty;
}

