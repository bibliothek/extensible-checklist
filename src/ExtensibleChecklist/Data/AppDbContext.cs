using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Template> Templates => Set<Template>();
    public DbSet<TemplateItem> TemplateItems => Set<TemplateItem>();
    public DbSet<Checklist> Checklists => Set<Checklist>();
    public DbSet<ChecklistItem> ChecklistItems => Set<ChecklistItem>();
    public DbSet<ChecklistShare> ChecklistShares => Set<ChecklistShare>();
    public DbSet<AppUser> Users => Set<AppUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Template>(e =>
        {
            e.HasMany(t => t.Items)
             .WithOne(i => i.Template)
             .HasForeignKey(i => i.TemplateId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Checklist>(e =>
        {
            e.HasMany(c => c.Items)
             .WithOne(i => i.Checklist)
             .HasForeignKey(i => i.ChecklistId)
             .OnDelete(DeleteBehavior.Cascade);

            e.HasMany(c => c.Shares)
             .WithOne(s => s.Checklist)
             .HasForeignKey(s => s.ChecklistId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChecklistShare>(e =>
        {
            e.HasIndex(s => new { s.ChecklistId, s.UserId }).IsUnique();
        });

        modelBuilder.Entity<AppUser>(e =>
        {
            e.HasKey(u => u.Username);
        });
    }
}
