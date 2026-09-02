using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExtensibleChecklist.Migrations
{
    /// <inheritdoc />
    public partial class AddChecklistSharing : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChecklistShares",
                columns: table => new
                {
                    Id = table.Column<int>(type: "INTEGER", nullable: false)
                        .Annotation("Sqlite:Autoincrement", true),
                    ChecklistId = table.Column<int>(type: "INTEGER", nullable: false),
                    UserId = table.Column<string>(type: "TEXT", nullable: false),
                    SharedBy = table.Column<string>(type: "TEXT", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChecklistShares", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChecklistShares_Checklists_ChecklistId",
                        column: x => x.ChecklistId,
                        principalTable: "Checklists",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Username = table.Column<string>(type: "TEXT", nullable: false),
                    DisplayName = table.Column<string>(type: "TEXT", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "TEXT", nullable: false),
                    LastSeenAt = table.Column<DateTime>(type: "TEXT", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Username);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChecklistShares_ChecklistId_UserId",
                table: "ChecklistShares",
                columns: new[] { "ChecklistId", "UserId" },
                unique: true);

            // Seed the directory with everyone who already owns data, so the
            // share picker is complete before those users next sign in.
            migrationBuilder.Sql(@"
                INSERT INTO ""Users"" (""Username"", ""DisplayName"", ""CreatedAt"", ""LastSeenAt"")
                SELECT ""UserId"", NULL,
                       strftime('%Y-%m-%d %H:%M:%S', 'now'),
                       strftime('%Y-%m-%d %H:%M:%S', 'now')
                FROM (
                    SELECT DISTINCT ""UserId"" FROM ""Checklists""
                    UNION
                    SELECT DISTINCT ""UserId"" FROM ""Templates""
                )
                WHERE TRIM(COALESCE(""UserId"", '')) <> ''
                  AND ""UserId"" NOT IN (SELECT ""Username"" FROM ""Users"");
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChecklistShares");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
