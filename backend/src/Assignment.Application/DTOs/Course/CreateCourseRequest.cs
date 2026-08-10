using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Course;

public class CreateCourseRequest
{
    [Required]
    [StringLength(50)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(200)]
    public string Name { get; set; } = string.Empty;

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public Guid TeacherId { get; set; }
}