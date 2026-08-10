using Assignment.Application.DTOs.Assignment;
using Assignment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AssignmentController : ControllerBase
{
    private readonly IAssignmentService _assignmentService;

    public AssignmentController(IAssignmentService assignmentService)
    {
        _assignmentService = assignmentService;
    }

    [HttpPost]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> CreateAssignment(
        CreateAssignmentRequest request)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var teacherId))
        {
            return Unauthorized();
        }

        var assignment = await _assignmentService.CreateAssignmentAsync(
            request,
            teacherId);

        if (assignment == null)
        {
            return NotFound(new
            {
                message = "Course not found or you are not the owner."
            });
        }

        return CreatedAtAction(
            nameof(GetAssignmentById),
            new { id = assignment.Id },
            assignment);
    }

    [HttpGet("course/{courseId:guid}")]
    public async Task<IActionResult> GetAssignmentsByCourse(
        Guid courseId)
    {
        var assignments =
            await _assignmentService.GetAssignmentsByCourseAsync(courseId);

        return Ok(assignments);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetAssignmentById(Guid id)
    {
        var assignment =
            await _assignmentService.GetAssignmentByIdAsync(id);

        if (assignment == null)
        {
            return NotFound(new
            {
                message = "Assignment not found."
            });
        }

        return Ok(assignment);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> UpdateAssignment(
        Guid id,
        CreateAssignmentRequest request)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var teacherId))
        {
            return Unauthorized();
        }

        var assignment =
            await _assignmentService.UpdateAssignmentAsync(
                id,
                request,
                teacherId);

        if (assignment == null)
        {
            return NotFound(new
            {
                message = "Assignment not found or you are not the owner."
            });
        }

        return Ok(assignment);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> DeleteAssignment(Guid id)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var teacherId))
        {
            return Unauthorized();
        }

        var deleted =
            await _assignmentService.DeleteAssignmentAsync(
                id,
                teacherId);

        if (!deleted)
        {
            return NotFound(new
            {
                message = "Assignment not found or you are not the owner."
            });
        }

        return NoContent();
    }
}