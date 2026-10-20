using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExtensibleChecklist.Migrations
{
    /// <inheritdoc />
    public partial class BackfillCompletedAt : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(
                "UPDATE ChecklistItems SET CompletedAt = strftime('%Y-%m-%d %H:%M:%f', 'now') WHERE Completed = 1 AND CompletedAt IS NULL;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
