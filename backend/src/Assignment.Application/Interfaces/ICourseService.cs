using Assignment.Application.DTOs.Course;

namespace Assignment.Application.Interfaces;

public interface ICourseService
{
    Task<CourseResponse> CreateCourseAsync(
        CreateCourseRequest request,
        Guid teacherId);

    Task<List<CourseResponse>> GetCoursesAsync();

    Task<CourseResponse?> GetCourseByIdAsync(Guid id);

    Task<CourseResponse?> UpdateCourseAsync(
        Guid id,
        CreateCourseRequest request,
        Guid teacherId);

    Task<bool> DeleteCourseAsync(
        Guid id,
        Guid teacherId);
}