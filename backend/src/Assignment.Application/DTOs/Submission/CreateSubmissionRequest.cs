namespace Assignment.Application.DTOs.Submission;

public class CreateSubmissionRequest
{
    public Guid AssignmentId { get; set; }

    public string Content { get; set; } = string.Empty;
}