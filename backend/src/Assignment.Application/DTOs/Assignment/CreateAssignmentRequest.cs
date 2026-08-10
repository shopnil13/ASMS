namespace Assignment.Application.DTOs.Assignment;

public class CreateAssignmentRequest
{
    public Guid CourseId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public decimal TotalMarks { get; set; }
}