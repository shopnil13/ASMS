namespace Assignment.Application.Interfaces;

public class StoredSubmissionFile
{
    public required byte[] Content { get; init; }

    public required string ContentType { get; init; }
}

public interface ISubmissionFileStorageService
{
    Task SaveAsync(
        string storagePath,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default);

    Task<StoredSubmissionFile?> GetAsync(
        string storagePath,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default);
}
