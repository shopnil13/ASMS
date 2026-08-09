using Assignment.Application.DTOs.Course;
using Assignment.Application.Interfaces;
using Assignment.Domain.Entities;
using Assignment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _dbContext;

    public CourseService(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<CourseResponse> CreateCourseAsync(
        CreateCourseRequest request,
        Guid teacherId)
    {
        var course = new Course
        {
            Id = Guid.NewGuid(),
            Code = request.Code,
            Name = request.Name,
            Description = request.Description,
            TeacherId = teacherId,
            CreatedAt = DateTime.UtcNow
        };

        _dbContext.Courses.Add(course);

        await _dbContext.SaveChangesAsync();

        return new CourseResponse
        {
            Id = course.Id,
            Code = course.Code,
            Name = course.Name,
            Description = course.Description,
            TeacherId = course.TeacherId,
            CreatedAt = course.CreatedAt
        };
    }

    public async Task<List<CourseResponse>> GetCoursesAsync()
    {
        return await _dbContext.Courses
            .AsNoTracking()
            .Select(course => new CourseResponse
            {
                Id = course.Id,
                Code = course.Code,
                Name = course.Name,
                Description = course.Description,
                TeacherId = course.TeacherId,
                CreatedAt = course.CreatedAt
            })
            .ToListAsync();
    }

    public async Task<CourseResponse?> GetCourseByIdAsync(Guid id)
    {
        return await _dbContext.Courses
            .AsNoTracking()
            .Where(course => course.Id == id)
            .Select(course => new CourseResponse
            {
                Id = course.Id,
                Code = course.Code,
                Name = course.Name,
                Description = course.Description,
                TeacherId = course.TeacherId,
                CreatedAt = course.CreatedAt
            })
            .FirstOrDefaultAsync();
    }
    public async Task<CourseResponse?> UpdateCourseAsync(
        Guid id, CreateCourseRequest request, Guid teacherId)
    {
        var course = await _dbContext.Courses
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.TeacherId == teacherId);

        if (course == null)
        {
            return null;
        }

        course.Code = request.Code;
        course.Name = request.Name;
        course.Description = request.Description;

        await _dbContext.SaveChangesAsync();

        return new CourseResponse
        {
            Id = course.Id,
            Code = course.Code,
            Name = course.Name,
            Description = course.Description,
            TeacherId = course.TeacherId,
            CreatedAt = course.CreatedAt
        };
    }

    public async Task<bool> DeleteCourseAsync(
    Guid id,
    Guid teacherId)
    {
        var course = await _dbContext.Courses
            .FirstOrDefaultAsync(c =>
                c.Id == id &&
                c.TeacherId == teacherId);

        if (course == null)
        {
            return false;
        }

        _dbContext.Courses.Remove(course);

        await _dbContext.SaveChangesAsync();

        return true;
    }
}