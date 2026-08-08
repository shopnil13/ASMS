using Assignment.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Assignment.Infrastructure.Configurations;

public class AssignmentConfiguration
    : IEntityTypeConfiguration<Assignment.Domain.Entities.Assignment>
{
    public void Configure(
        EntityTypeBuilder<Assignment.Domain.Entities.Assignment> builder)
    {
        builder.ToTable("Assignments");

        builder.HasKey(assignment => assignment.Id);

        builder.Property(assignment => assignment.Title)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(assignment => assignment.Description)
            .HasMaxLength(5000);

        builder.Property(assignment => assignment.DueDate)
            .IsRequired();

        builder.Property(assignment => assignment.TotalMarks)
            .HasPrecision(10, 2)
            .IsRequired();

        builder.Property(assignment => assignment.CreatedAt)
            .IsRequired();

        builder.HasOne<Course>()
            .WithMany()
            .HasForeignKey(assignment => assignment.CourseId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}