namespace Assignment.Application.DTOs.Admin;

public enum DeleteUserResult
{
    Deleted = 1,
    NotFound = 2,
    CannotDeleteSelf = 3,
    UserHasDependencies = 4
}

