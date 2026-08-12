using Assignment.Application.Interfaces;
using Microsoft.Extensions.Configuration;

namespace Assignment.Infrastructure.Services;

public class LocalSubmissionFileStorageService : ISubmissionFileStorageService
{
    private readonly string _storageRoot;

    public LocalSubmissionFileStorageService(IConfiguration configuration)
    {
        var configuredPath = configuration["Storage:LocalPath"] ?? "SubmissionFiles";

        _storageRoot = Path.IsPathRooted(configuredPath)
            ? configuredPath
            : Path.Combine(AppContext.BaseDirectory, configuredPath);
    }

    public async Task SaveAsync(
        string storagePath,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        var filePath = GetFilePath(storagePath);
        Directory.CreateDirectory(Path.GetDirectoryName(filePath)!);

        await using var fileStream = File.Create(filePath);
        await content.CopyToAsync(fileStream, cancellationToken);
    }

    public async Task<StoredSubmissionFile?> GetAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        var filePath = GetFilePath(storagePath);

        if (!File.Exists(filePath))
        {
            return null;
        }

        return new StoredSubmissionFile
        {
            Content = await File.ReadAllBytesAsync(filePath, cancellationToken),
            ContentType = "application/pdf"
        };
    }

    public Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        var filePath = GetFilePath(storagePath);

        if (File.Exists(filePath))
        {
            File.Delete(filePath);
        }

        return Task.CompletedTask;
    }

    private string GetFilePath(string storagePath)
    {
        var normalizedPath = storagePath
            .Replace('/', Path.DirectorySeparatorChar)
            .Replace('\\', Path.DirectorySeparatorChar);

        return Path.Combine(_storageRoot, normalizedPath);
    }
}
