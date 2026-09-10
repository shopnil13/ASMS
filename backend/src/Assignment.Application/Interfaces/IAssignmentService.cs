using Assignment.Application.DTOs;
using Assignment.Application.DTOs.Assignment;

namespace Assignment.Application.Interfaces;

public interface IAssignmentService
{
    Task<AssignmentResponse?> CreateAssignmentAsync(
        CreateAssignmentRequest request,
        Guid teacherId);

    Task<PagedResult<AssignmentResponse>> GetAssignmentsByCourseAsync(
        Guid courseId,
        string? search,
        int page,
        int pageSize);

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