namespace Assignment.Application.DTOs.Course;

public class CourseResponse
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid TeacherId { get; set; }

    public DateTime CreatedAt { get; set; }
}