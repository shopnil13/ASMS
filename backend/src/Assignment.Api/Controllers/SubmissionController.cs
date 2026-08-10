using Assignment.Application.DTOs.Submission;
using Assignment.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Assignment.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SubmissionController : ControllerBase
{
    private readonly ISubmissionService _submissionService;

    public SubmissionController(ISubmissionService submissionService)
    {
        _submissionService = submissionService;
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> CreateSubmission(
        CreateSubmissionRequest request)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var studentId))
        {
            return Unauthorized();
        }

        var submission =
            await _submissionService.CreateSubmissionAsync(
                request,
                studentId);

        if (submission == null)
        {
            return BadRequest(new
            {
                message = "Assignment not found or you have already submitted it."
            });
        }

        return CreatedAtAction(
            nameof(GetSubmissionById),
            new { id = submission.Id },
            submission);
    }

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetSubmissionById(Guid id)
    {
        var userIdClaim = User.FindFirstValue(
            ClaimTypes.NameIdentifier);

        if (userIdClaim == null)
        {
            return Unauthorized();
        }

        if (!Guid.TryParse(userIdClaim, out var userId))
        {
            return Unauthorized();
        }

        var submission =
            await _submissionService.GetSubmissionByIdAsync(
                id,
                userId);

        if (submission == null)
        {
            return NotFound(new
            {
                message = "Submission not found or you do not have access."
            });
        }

        return Ok(submission);
    }

    [HttpGet("assignment/{assignmentId:guid}")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GetSubmissionsByAssignment(
        Guid assignmentId)
    {
        var submissions =
            await _submissionService.GetSubmissionsByAssignmentAsync(
                assignmentId);

        return Ok(submissions);
    }

    [HttpPut("{id:guid}/grade")]
    [Authorize(Roles = "Teacher")]
    public async Task<IActionResult> GradeSubmission(
        Guid id,
        decimal marksObtained,
        string? feedback)
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

        var submission =
            await _submissionService.GradeSubmissionAsync(
                id,
                marksObtained,
                feedback,
                teacherId);

        if (submission == null)
        {
            return NotFound(new
            {
                message = "Submission not found or you are not the course owner."
            });
        }

        return Ok(submission);
    }
}