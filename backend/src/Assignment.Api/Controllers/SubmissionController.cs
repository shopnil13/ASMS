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
    private const long MaxPdfBytes = 25 * 1024 * 1024;
    private readonly ISubmissionService _submissionService;
    private readonly IWebHostEnvironment _environment;

    public SubmissionController(
        ISubmissionService submissionService,
        IWebHostEnvironment environment)
    {
        _submissionService = submissionService;
        _environment = environment;
    }

    [HttpPost]
    [Authorize(Roles = "Student")]
    [RequestSizeLimit(MaxPdfBytes + 1024 * 1024)]
    public async Task<IActionResult> CreateSubmission(
        [FromForm] CreateSubmissionFormRequest request)
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

        if (request.PdfFile == null || request.PdfFile.Length == 0)
        {
            return BadRequest(new
            {
                message = "A PDF file is required."
            });
        }

        if (!IsPdf(request.PdfFile))
        {
            return BadRequest(new
            {
                message = "Only PDF files are allowed."
            });
        }

        if (request.PdfFile.Length > MaxPdfBytes)
        {
            return BadRequest(new
            {
                message = "PDF file must be 25 MB or smaller."
            });
        }

        var storageName = $"{Guid.NewGuid():N}.pdf";

        var createRequest = new CreateSubmissionRequest
        {
            AssignmentId = request.AssignmentId,
            Content = request.Content ?? string.Empty,
            FileName = Path.GetFileName(request.PdfFile.FileName),
            FileStorageName = storageName,
            FileContentType = "application/pdf",
            FileSize = request.PdfFile.Length
        };

        var submission =
            await _submissionService.CreateSubmissionAsync(
                createRequest,
                studentId);

        if (submission == null)
        {
            return BadRequest(new
            {
                message = "Assignment not found or you have already submitted it."
            });
        }

        var uploadPath = GetUploadPath(storageName);
        Directory.CreateDirectory(Path.GetDirectoryName(uploadPath)!);

        await using (var stream = System.IO.File.Create(uploadPath))
        {
            await request.PdfFile.CopyToAsync(stream);
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

    [HttpGet("{id:guid}/file")]
    public async Task<IActionResult> GetSubmissionFile(
        Guid id,
        bool download = false)
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

        if (submission?.FileStorageName == null)
        {
            return NotFound(new
            {
                message = "Submission file not found or you do not have access."
            });
        }

        var uploadPath = GetUploadPath(submission.FileStorageName);

        if (!System.IO.File.Exists(uploadPath))
        {
            return NotFound(new
            {
                message = "Submission file is missing from storage."
            });
        }

        var stream = System.IO.File.OpenRead(uploadPath);

        if (download)
        {
            return File(
                stream,
                submission.FileContentType ?? "application/pdf",
                submission.FileName ?? "submission.pdf",
                enableRangeProcessing: true);
        }

        return File(
            stream,
            submission.FileContentType ?? "application/pdf",
            enableRangeProcessing: true);
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

    [HttpGet("assignment/{assignmentId:guid}/mine")]
    [Authorize(Roles = "Student")]
    public async Task<IActionResult> GetMySubmissionByAssignment(
        Guid assignmentId)
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
            await _submissionService.GetStudentSubmissionForAssignmentAsync(
                assignmentId,
                studentId);

        if (submission == null)
        {
            return NotFound(new
            {
                message = "Submission not found."
            });
        }

        return Ok(submission);
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

    private string GetUploadPath(string storageName)
    {
        return Path.Combine(
            _environment.ContentRootPath,
            "SubmissionFiles",
            storageName);
    }

    private static bool IsPdf(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName);

        return string.Equals(extension, ".pdf", StringComparison.OrdinalIgnoreCase)
            && string.Equals(
                file.ContentType,
                "application/pdf",
                StringComparison.OrdinalIgnoreCase);
    }
}

public class CreateSubmissionFormRequest
{
    [FromForm]
    public Guid AssignmentId { get; set; }

    [FromForm]
    public string? Content { get; set; }

    [FromForm]
    public IFormFile? PdfFile { get; set; }
}
