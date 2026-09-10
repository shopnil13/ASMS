using Assignment.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Net.Http.Json;

namespace Assignment.Infrastructure.Services;

public class SupabaseSubmissionFileStorageService : ISubmissionFileStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _bucket;

    public SupabaseSubmissionFileStorageService(
        HttpClient httpClient,
        IConfiguration configuration)
    {
        var supabaseUrl = configuration["Supabase:Url"]
            ?? throw new InvalidOperationException("Supabase URL is not configured.");

        var serviceRoleKey = configuration["Supabase:ServiceRoleKey"]
            ?? throw new InvalidOperationException("Supabase service role key is not configured.");

        _bucket = configuration["Supabase:StorageBucket"] ?? "submissions";
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri(supabaseUrl.TrimEnd('/') + "/storage/v1/");
        _httpClient.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue(
                "Bearer",
                serviceRoleKey);
        _httpClient.DefaultRequestHeaders.Add("apikey", serviceRoleKey);
    }

    public async Task SaveAsync(
        string storagePath,
        Stream content,
        string contentType,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Post,
            $"object/{_bucket}/{storagePath}");

        request.Headers.Add("x-upsert", "true");
        request.Content = new StreamContent(content);
        request.Content.Headers.ContentType =
            new System.Net.Http.Headers.MediaTypeHeaderValue(contentType);

        using var response = await _httpClient.SendAsync(
            request,
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }

    public async Task<StoredSubmissionFile?> GetAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        using var response = await _httpClient.GetAsync(
            $"object/{_bucket}/{storagePath}",
            cancellationToken);

        if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return null;
        }

        response.EnsureSuccessStatusCode();

        return new StoredSubmissionFile
        {
            Content = await response.Content.ReadAsByteArrayAsync(cancellationToken),
            ContentType = response.Content.Headers.ContentType?.MediaType
                ?? "application/pdf"
        };
    }

    public async Task DeleteAsync(
        string storagePath,
        CancellationToken cancellationToken = default)
    {
        using var request = new HttpRequestMessage(
            HttpMethod.Delete,
            $"object/{_bucket}/{storagePath}");

        request.Content = JsonContent.Create(new
        {
            prefixes = new[] { storagePath }
        });

        using var response = await _httpClient.SendAsync(
            request,
            cancellationToken);

        response.EnsureSuccessStatusCode();
    }
}
