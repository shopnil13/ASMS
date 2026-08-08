using Assignment.Application.DTOs;

namespace Assignment.Application.Interfaces;

public interface IAuthService
{
    Task<RegisterResponse> RegisterAsync(RegisterRequest request);
}