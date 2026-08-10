using Assignment.Application.DTOs.Assignment;
using Assignment.Application.Interfaces;
using Assignment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Infrastructure.Services;

public class AssignmentService : IAssignmentService
{
    private readonly ApplicationDbContext _dbContext;

    public AssignmentService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<AssignmentResponse?> CreateAssignmentAsync(
        CreateAssignmentRequest request,
        Guid teacherId)
    {
        // First, verify that the course exists
        // and belongs to the logged-in teacher.
        var course = await _dbContext.Courses
            .FirstOrDefaultAsync(c =>
                c.Id == request.CourseId &&
                c.TeacherId == teacherId);

        if (course == null)
        {
            return null;
        }

        var assignment = new Domain.Entities.Assignment
        {
            Id = Guid.NewGuid(),
            CourseId = request.CourseId,
            Title = request.Title,
            Description = request.Description,
            DueDate = request.DueDate,
            TotalMarks = request.TotalMarks,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Assignments.Add(assignment);

        await _dbContext.SaveChangesAsync();

        return new AssignmentResponse
        {
            Id = assignment.Id,
            CourseId = assignment.CourseId,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            TotalMarks = assignment.TotalMarks,
            CreatedAt = assignment.CreatedAt
        };
    }

    public async Task<List<AssignmentResponse>> GetAssignmentsByCourseAsync(
        Guid courseId)
    {
        return await _dbContext.Assignments
            .AsNoTracking()
            .Where(a => a.CourseId == courseId)
            .Select(a => new AssignmentResponse
            {
                Id = a.Id,
                CourseId = a.CourseId,
                Title = a.Title,
                Description = a.Description,
                DueDate = a.DueDate,
                TotalMarks = a.TotalMarks,
                CreatedAt = a.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<AssignmentResponse?> GetAssignmentByIdAsync(
        Guid id)
    {
        return await _dbContext.Assignments
            .AsNoTracking()
            .Where(a => a.Id == id)
            .Select(a => new AssignmentResponse
            {
                Id = a.Id,
                CourseId = a.CourseId,
                Title = a.Title,
                Description = a.Description,
                DueDate = a.DueDate,
                TotalMarks = a.TotalMarks,
                CreatedAt = a.CreatedAt
            })
            .FirstOrDefaultAsync();
    }

    public async Task<AssignmentResponse?> UpdateAssignmentAsync(
        Guid id,
        CreateAssignmentRequest request,
        Guid teacherId)
    {
        var assignment = await _dbContext.Assignments
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
        {
            return null;
        }

        // Verify that the assignment's course belongs to the logged-in teacher.
        var course = await _dbContext.Courses
            .FirstOrDefaultAsync(c =>
                c.Id == assignment.CourseId &&
                c.TeacherId == teacherId);

        if (course == null)
        {
            return null;
        }

        // Don't allow moving an existing assignment
        // to another course through this endpoint.
        if (assignment.CourseId != request.CourseId)
        {
            return null;
        }

        assignment.Title = request.Title;
        assignment.Description = request.Description;
        assignment.DueDate = request.DueDate;
        assignment.TotalMarks = request.TotalMarks;

        await _dbContext.SaveChangesAsync();

        return new AssignmentResponse
        {
            Id = assignment.Id,
            CourseId = assignment.CourseId,
            Title = assignment.Title,
            Description = assignment.Description,
            DueDate = assignment.DueDate,
            TotalMarks = assignment.TotalMarks,
            CreatedAt = assignment.CreatedAt
        };
    }

    public async Task<bool> DeleteAssignmentAsync(
        Guid id,
        Guid teacherId)
    {
        var assignment = await _dbContext.Assignments
            .FirstOrDefaultAsync(a => a.Id == id);

        if (assignment == null)
        {
            return false;
        }

        // Verify that the assignment's course belongs to the logged-in teacher.
        var course = await _dbContext.Courses
            .FirstOrDefaultAsync(c =>
                c.Id == assignment.CourseId &&
                c.TeacherId == teacherId);

        if (course == null)
        {
            return false;
        }

        _dbContext.Assignments.Remove(assignment);

        await _dbContext.SaveChangesAsync();

        return true;
    }
}