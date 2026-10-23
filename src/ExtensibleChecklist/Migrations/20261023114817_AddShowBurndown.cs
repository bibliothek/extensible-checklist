using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ExtensibleChecklist.Migrations
{
    /// <inheritdoc />
    public partial class AddShowBurndown : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "ShowBurndown",
                table: "Checklists",
                type: "INTEGER",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ShowBurndown",
                table: "Checklists");
        }
    }
}
