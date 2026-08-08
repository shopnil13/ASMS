namespace Assignment.Domain.Entities;

public class Course
{
    public Guid Id { get; set; }

    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public Guid TeacherId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}