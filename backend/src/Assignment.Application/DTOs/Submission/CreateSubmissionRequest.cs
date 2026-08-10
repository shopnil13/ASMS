using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Submission;

public class CreateSubmissionRequest
{
    [Required]
    public Guid AssignmentId { get; set; }

    [Required]
    [StringLength(10000)]
    public string Content { get; set; } = string.Empty;
}