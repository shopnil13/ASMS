namespace Assignment.Domain.Entities;

public class Submission
{
    public Guid Id { get; set; }

    public Guid AssignmentId { get; set; }

    public Guid StudentId { get; set; }

    public string Content { get; set; } = string.Empty;

    public string? FileName { get; set; }

    public string? FileStorageName { get; set; }

    public string? FileContentType { get; set; }

    public long? FileSize { get; set; }

    public DateTime SubmittedAt { get; set; }

    public decimal? MarksObtained { get; set; }

    public string? Feedback { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
