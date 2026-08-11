using System.ComponentModel.DataAnnotations;

namespace Assignment.Application.DTOs.Submission;

public class CreateSubmissionRequest
{
    [Required]
    public Guid AssignmentId { get; set; }

    [StringLength(10000)]
    public string Content { get; set; } = string.Empty;

    [StringLength(255)]
    public string? FileName { get; set; }

    [StringLength(255)]
    public string? FileStorageName { get; set; }

    [StringLength(100)]
    public string? FileContentType { get; set; }

    public long? FileSize { get; set; }
}
