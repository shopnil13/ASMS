using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Admin;

public class ResetPasswordRequest
{
    [Required]
    [MinLength(8)]
    [StringLength(100)]
    public string NewPassword { get; set; } = string.Empty;
}
