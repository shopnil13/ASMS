using Assignment.Infrastructure.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Assignment.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly ApplicationDbContext _dbContext;

    public HealthController(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    [Authorize]
    [HttpGet("health")]
    public async Task<IActionResult> GetHealth()
    {
        var databaseHealthy = await _dbContext.Database.CanConnectAsync();

        if (!databaseHealthy)
        {
            return StatusCode(503, new
            {
                status = "Unhealthy",
                database = "Unavailable"
            });
        }

        return Ok(new
        {
            status = "Healthy",
            database = "Connected"
        });
    }
}