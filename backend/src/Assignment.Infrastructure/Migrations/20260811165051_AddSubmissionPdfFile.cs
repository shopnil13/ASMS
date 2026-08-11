using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Assignment.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddSubmissionPdfFile : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "FileContentType",
                table: "Submissions",
                type: "character varying(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileName",
                table: "Submissions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<long>(
                name: "FileSize",
                table: "Submissions",
                type: "bigint",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FileStorageName",
                table: "Submissions",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FileContentType",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "FileName",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "FileSize",
                table: "Submissions");

            migrationBuilder.DropColumn(
                name: "FileStorageName",
                table: "Submissions");
        }
    }
}
