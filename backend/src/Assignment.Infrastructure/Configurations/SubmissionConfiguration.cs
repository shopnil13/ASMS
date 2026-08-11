using Assignment.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Assignment.Infrastructure.Configurations;

public class SubmissionConfiguration
    : IEntityTypeConfiguration<Submission>
{
    public void Configure(
        EntityTypeBuilder<Submission> builder)
    {
        builder.ToTable("Submissions");

        builder.HasKey(submission => submission.Id);

        builder.Property(submission => submission.Content)
            .IsRequired();

        builder.Property(submission => submission.FileName)
            .HasMaxLength(255);

        builder.Property(submission => submission.FileStorageName)
            .HasMaxLength(255);

        builder.Property(submission => submission.FileContentType)
            .HasMaxLength(100);

        builder.Property(submission => submission.SubmittedAt)
            .IsRequired();

        builder.Property(submission => submission.MarksObtained)
            .HasPrecision(10, 2);

        builder.Property(submission => submission.Feedback)
            .HasMaxLength(5000);

        builder.Property(submission => submission.CreatedAt)
            .IsRequired();

        builder.HasOne<Assignment.Domain.Entities.Assignment>()
            .WithMany()
            .HasForeignKey(submission => submission.AssignmentId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(submission => submission.StudentId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasIndex(submission => new
        {
            submission.AssignmentId,
            submission.StudentId
        })
        .IsUnique();
    }
}
