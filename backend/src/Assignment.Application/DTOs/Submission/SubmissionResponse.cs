namespace Assignment.Application.DTOs.Submission;

public class SubmissionResponse
{
    public Guid Id { get; set; }

    public Guid AssignmentId { get; set; }

    public Guid StudentId { get; set; }

    public string StudentName { get; set; } = string.Empty;

    public string Content { get; set; } = string.Empty;

    public string? FileName { get; set; }

    public string? FileStorageName { get; set; }

    public string? FileContentType { get; set; }

    public long? FileSize { get; set; }

    public string? FileUrl { get; set; }

    public DateTime SubmittedAt { get; set; }

    public decimal? MarksObtained { get; set; }

    public string? Feedback { get; set; }

    public DateTime CreatedAt { get; set; }
}
