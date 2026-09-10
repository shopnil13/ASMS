using Assignment.Application.DTOs;
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

    Task<PagedResult<SubmissionResponse>?> GetSubmissionsByAssignmentAsync(
        Guid assignmentId,
        Guid teacherId,
        string? search,
        int page,
        int pageSize);

    Task<List<SubmissionResponse>> GetSubmissionsByStudentAsync(
        Guid studentId);

    Task<SubmissionResponse?> GetStudentSubmissionForAssignmentAsync(
        Guid assignmentId,
        Guid studentId);

    Task<SubmissionResponse?> GradeSubmissionAsync(
        Guid id,
        decimal marksObtained,
        string? feedback,
        Guid teacherId);
}
