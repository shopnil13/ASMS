namespace Assignment.Application.DTOs;

public class PagedResult<T>
{
    public required List<T> Items { get; init; }

    public int Page { get; init; }

    public int PageSize { get; init; }

    public int TotalCount { get; init; }

    public int TotalPages =>
        PageSize <= 0
            ? 0
            : (int)Math.Ceiling(TotalCount / (double)PageSize);
}
