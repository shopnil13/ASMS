using Assignment.Application.DTOs.Course;
using Assignment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CourseController : ControllerBase
{
    private readonly ICourseService _courseService;

    public CourseController(ICourseService courseService)
    {
        _courseService = courseService;
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateCourse(
        CreateCourseRequest request)
    {
        var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var teacherId))
        {
            return Unauthorized();
        }

        var course = await _courseService.CreateCourseAsync(
            request,
            teacherId);

        return CreatedAtAction(
            nameof(GetCourseById),
            new { id = course.Id },
            course);
    }

    [HttpGet]
    public async Task<IActionResult> GetCourses()
    {
        var courses = await _courseService.GetCoursesAsync();

        return Ok(courses);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetCourseById(Guid id)
    {
        var course = await _courseService.GetCourseByIdAsync(id);

        if (course == null)
        {
            return NotFound(new
            {
                message = "Course not found."
            });
        }

        return Ok(course);
    }
    [HttpPut("{id:guid}")]
[Authorize(Roles = "Teacher")]
public async Task<IActionResult> UpdateCourse(
    Guid id,
    CreateCourseRequest request)
{
    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (userIdClaim == null)
    {
        return Unauthorized();
    }

    if (!Guid.TryParse(userIdClaim, out var teacherId))
    {
        return Unauthorized();
    }

    var course = await _courseService.UpdateCourseAsync(
        id,
        request,
        teacherId);

    if (course == null)
    {
        return NotFound(new
        {
            message = "Course not found or you are not the owner."
        });
    }

    return Ok(course);
}

[HttpDelete("{id:guid}")]
[Authorize(Roles = "Teacher")]
public async Task<IActionResult> DeleteCourse(Guid id)
{
    var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier);

    if (userIdClaim == null)
    {
        return Unauthorized();
    }

    if (!Guid.TryParse(userIdClaim, out var teacherId))
    {
        return Unauthorized();
    }

    var deleted = await _courseService.DeleteCourseAsync(
        id,
        teacherId);

    if (!deleted)
    {
        return NotFound(new
        {
            message = "Course not found or you are not the owner."
        });
    }

    return NoContent();
}
}
