using Assignment.Application.Interfaces;

namespace Assignment.Application.Services;

public class HealthService : IHealthService
{
    public string GetHealthStatus()
    {
        return "Healthy";
    }
}