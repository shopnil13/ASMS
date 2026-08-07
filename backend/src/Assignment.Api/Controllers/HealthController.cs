using Assignment.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace Assignment.Api.Controllers;


[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly IHealthService _healthService;
    
    public HealthController(IHealthService healthService)
    {
        _healthService = healthService;
    }

    [HttpGet]
    public IActionResult GetHealth()
    {
        var status = _healthService.GetHealthStatus();
        return Ok(new { status });
    }
}
