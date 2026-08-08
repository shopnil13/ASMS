using Assignment.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Assignment.Infrastructure.Configurations;

public class CourseConfiguration : IEntityTypeConfiguration<Course>
{
    public void Configure(EntityTypeBuilder<Course> builder)
    {
        builder.ToTable("Courses");

        builder.HasKey(course => course.Id);

        builder.Property(course => course.Code)
            .IsRequired()
            .HasMaxLength(50);

        builder.HasIndex(course => course.Code)
            .IsUnique();

        builder.Property(course => course.Name)
            .IsRequired()
            .HasMaxLength(200);

        builder.Property(course => course.Description)
            .HasMaxLength(2000);

        builder.Property(course => course.CreatedAt)
            .IsRequired();

        builder.HasOne<User>()
            .WithMany()
            .HasForeignKey(course => course.TeacherId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}