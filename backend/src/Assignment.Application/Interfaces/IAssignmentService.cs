using Assignment.Application.DTOs.Assignment;

namespace Assignment.Application.Interfaces;

public interface IAssignmentService
{
    Task<AssignmentResponse?> CreateAssignmentAsync(
        CreateAssignmentRequest request,
        Guid teacherId);

    Task<List<AssignmentResponse>> GetAssignmentsByCourseAsync(
        Guid courseId);

    Task<AssignmentResponse?> GetAssignmentByIdAsync(
        Guid id);

    Task<AssignmentResponse?> UpdateAssignmentAsync(
        Guid id,
        CreateAssignmentRequest request,
        Guid teacherId);

    Task<bool> DeleteAssignmentAsync(
        Guid id,
        Guid teacherId);
}