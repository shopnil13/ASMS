using Assignment.Application.DTOs.Submission;
using Assignment.Application.Interfaces;
using Assignment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Infrastructure.Services;

public class SubmissionService : ISubmissionService
{
    private readonly ApplicationDbContext _dbContext;

    public SubmissionService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<SubmissionResponse?> CreateSubmissionAsync(
        CreateSubmissionRequest request,
        Guid studentId)
    {
        // Verify that the assignment exists.
        var assignment = await _dbContext.Assignments
            .FirstOrDefaultAsync(a => a.Id == request.AssignmentId);

        if (assignment == null)
        {
            return null;
        }

        // Make sure this student has not already submitted
        // this assignment.
        var existingSubmission = await _dbContext.Submissions
            .FirstOrDefaultAsync(s =>
                s.AssignmentId == request.AssignmentId &&
                s.StudentId == studentId);

        if (existingSubmission != null)
        {
            return null;
        }

        var submission = new Domain.Entities.Submission
        {
            Id = request.Id == Guid.Empty
                ? Guid.NewGuid()
                : request.Id,
            AssignmentId = request.AssignmentId,
            StudentId = studentId,
            Content = request.Content,
            FileName = request.FileName,
            FileStorageName = request.FileStorageName,
            FileContentType = request.FileContentType,
            FileSize = request.FileSize,
            SubmittedAt = DateTime.UtcNow,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Submissions.Add(submission);

        await _dbContext.SaveChangesAsync();

        return await MapToResponseAsync(submission);
    }

    public async Task<SubmissionResponse?> GetSubmissionByIdAsync(
        Guid id,
        Guid userId)
    {
        var submission = await _dbContext.Submissions
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null)
        {
            return null;
        }

        // The student can view their own submission.
        if (submission.StudentId == userId)
        {
            return await MapToResponseAsync(submission);
        }

        // A teacher can view the submission if they own
        // the course containing the assignment.
        var teacherOwnsAssignment = await _dbContext.Assignments
            .Where(a => a.Id == submission.AssignmentId)
            .Join(
                _dbContext.Courses,
                assignment => assignment.CourseId,
                course => course.Id,
                (assignment, course) => course)
            .AnyAsync(c => c.TeacherId == userId);

        if (!teacherOwnsAssignment)
        {
            return null;
        }

        return await MapToResponseAsync(submission);
    }

    public async Task<List<SubmissionResponse>> GetSubmissionsByAssignmentAsync(
        Guid assignmentId)
    {
        return await _dbContext.Submissions
            .AsNoTracking()
            .Where(s => s.AssignmentId == assignmentId)
            .Select(s => new SubmissionResponse
            {
                Id = s.Id,
                AssignmentId = s.AssignmentId,
                StudentId = s.StudentId,
                StudentName = _dbContext.Users
                    .Where(u => u.Id == s.StudentId)
                    .Select(u => u.FirstName + " " + u.LastName)
                    .FirstOrDefault() ?? "Unknown Student",
                Content = s.Content,
                FileName = s.FileName,
                FileStorageName = s.FileStorageName,
                FileContentType = s.FileContentType,
                FileSize = s.FileSize,
                FileUrl = s.FileStorageName == null
                    ? null
                    : $"/Submission/{s.Id}/file",
                SubmittedAt = s.SubmittedAt,
                MarksObtained = s.MarksObtained,
                Feedback = s.Feedback,
                CreatedAt = s.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<SubmissionResponse?> GetStudentSubmissionForAssignmentAsync(
        Guid assignmentId,
        Guid studentId)
    {
        var submission = await _dbContext.Submissions
            .AsNoTracking()
            .FirstOrDefaultAsync(s =>
                s.AssignmentId == assignmentId &&
                s.StudentId == studentId);

        return submission == null
            ? null
            : await MapToResponseAsync(submission);
    }

    public async Task<SubmissionResponse?> GradeSubmissionAsync(
        Guid id,
        decimal marksObtained,
        string? feedback,
        Guid teacherId)
    {
        var submission = await _dbContext.Submissions
            .FirstOrDefaultAsync(s => s.Id == id);

        if (submission == null)
        {
            return null;
        }

        var assignment = await _dbContext.Assignments
            .FirstOrDefaultAsync(a => a.Id == submission.AssignmentId);

        if (assignment == null)
        {
            return null;
        }

        // Verify that the logged-in teacher owns
        // the course containing this assignment.
        var teacherOwnsAssignment = await _dbContext.Courses
            .AnyAsync(c =>
                c.Id == assignment.CourseId &&
                c.TeacherId == teacherId);

        if (!teacherOwnsAssignment)
        {
            return null;
        }

        // A grade cannot exceed the assignment's total marks.
        if (marksObtained < 0 || marksObtained > assignment.TotalMarks)
        {   
            throw new ArgumentOutOfRangeException(
                nameof(marksObtained),
                $"Marks must be between 0 and {assignment.TotalMarks}.");
        }

        submission.MarksObtained = marksObtained;
        submission.Feedback = feedback;

        await _dbContext.SaveChangesAsync();

        return await MapToResponseAsync(submission);
    }

    private async Task<SubmissionResponse> MapToResponseAsync(
        Domain.Entities.Submission submission)
    {
        var studentName = await _dbContext.Users
            .Where(u => u.Id == submission.StudentId)
            .Select(u => u.FirstName + " " + u.LastName)
            .FirstOrDefaultAsync();

        return new SubmissionResponse
        {
            Id = submission.Id,
            AssignmentId = submission.AssignmentId,
            StudentId = submission.StudentId,
            StudentName = studentName ?? "Unknown Student",
            Content = submission.Content,
            FileName = submission.FileName,
            FileStorageName = submission.FileStorageName,
            FileContentType = submission.FileContentType,
            FileSize = submission.FileSize,
            FileUrl = submission.FileStorageName == null
                ? null
                : $"/Submission/{submission.Id}/file",
            SubmittedAt = submission.SubmittedAt,
            MarksObtained = submission.MarksObtained,
            Feedback = submission.Feedback,
            CreatedAt = submission.CreatedAt
        };
    }
}
