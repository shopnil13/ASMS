namespace Assignment.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; }

    public Guid CourseId { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public DateTime DueDate { get; set; }

    public decimal TotalMarks { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

}