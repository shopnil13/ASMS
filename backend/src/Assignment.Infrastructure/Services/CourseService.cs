using Assignment.Application.DTOs;
using Assignment.Application.DTOs.Course;
using Assignment.Application.Interfaces;
using Assignment.Domain.Entities;
using Assignment.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Infrastructure.Services;

public class CourseService : ICourseService
{
    private readonly ApplicationDbContext _dbContext;
    private readonly ISubmissionFileStorageService _fileStorageService;

    public CourseService(
        ApplicationDbContext dbContext,
        ISubmissionFileStorageService fileStorageService)
    {
        _dbContext = dbContext;
        _fileStorageService = fileStorageService;
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

    public async Task<PagedResult<CourseResponse>> GetCoursesAsync(
        string? search,
        int page,
        int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 100);

        var query = _dbContext.Courses.AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(course =>
                EF.Functions.ILike(course.Code, $"%{search}%") ||
                EF.Functions.ILike(course.Name, $"%{search}%"));
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderBy(course => course.Code)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return new PagedResult<CourseResponse>
        {
            Items = items,
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };
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

        var assignmentIds = await _dbContext.Assignments
            .Where(a => a.CourseId == id)
            .Select(a => a.Id)
            .ToListAsync();

        var fileStorageNames = await _dbContext.Submissions
            .Where(s =>
                assignmentIds.Contains(s.AssignmentId) &&
                s.FileStorageName != null)
            .Select(s => s.FileStorageName!)
            .ToListAsync();

        _dbContext.Courses.Remove(course);

        await _dbContext.SaveChangesAsync();

        foreach (var fileStorageName in fileStorageNames)
        {
            await _fileStorageService.DeleteAsync(fileStorageName);
        }

        return true;
    }
}