using Assignment.Application.DTOs.Submission;

namespace Assignment.Application.Interfaces;

public interface ISubmissionService
{
    Task<SubmissionResponse?> CreateSubmissionAsync(
        CreateSubmissionRequest request,
        Guid studentId);

    Task<SubmissionResponse?> GetSubmissionByIdAsync(
        Guid id,
        Guid userId);

    Task<List<SubmissionResponse>> GetSubmissionsByAssignmentAsync(
        Guid assignmentId);

    Task<SubmissionResponse?> GradeSubmissionAsync(
        Guid id,
        decimal marksObtained,
        string? feedback,
        Guid teacherId);
}