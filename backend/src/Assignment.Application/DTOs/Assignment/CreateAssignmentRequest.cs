using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Assignment;

public class CreateAssignmentRequest
{
    [Required]
    public Guid CourseId { get; set; }

    [Required]
    [StringLength(200)]
    public string Title { get; set; } = string.Empty;

    [StringLength(5000)]
    public string Description { get; set; } = string.Empty;

    [Required]
    public DateTime DueDate { get; set; }

    [Range(0.01, 1000000)]
    public decimal TotalMarks { get; set; }
}