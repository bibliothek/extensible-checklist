using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages.Checklists;

public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public List<Template> Templates { get; set; } = [];

    [BindProperty]
    public string ChecklistName { get; set; } = "";

    [BindProperty]
    public List<int> SelectedTemplateIds { get; set; } = [];

    public string? ErrorMessage { get; set; }

    public CreateModel(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    private string GetUsername() =>
        User.FindFirstValue("preferred_username")
        ?? User.FindFirstValue("name")
        ?? User.FindFirstValue(ClaimTypes.Name)
        ?? User.Identity?.Name
        ?? "unknown";

    public async Task OnGetAsync()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        Templates = await _db.Templates
            .Where(t => t.UserId == GetUsername())
            .Include(t => t.Items.OrderBy(i => i.Order))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        Templates = await _db.Templates
            .Where(t => t.UserId == GetUsername())
            .Include(t => t.Items.OrderBy(i => i.Order))
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync();

        // Generate default name if empty
        var name = ChecklistName?.Trim();
        if (string.IsNullOrEmpty(name))
        {
            var date = DateTime.UtcNow.ToString("yyyy-MM-dd");
            if (SelectedTemplateIds.Count > 0)
            {
                var templateNames = Templates
                    .Where(t => SelectedTemplateIds.Contains(t.Id))
                    .Select(t => t.Name);
                name = $"{string.Join(" + ", templateNames)} - {date}";
            }
            else
            {
                name = $"Checklist {date}";
            }
        }

        // Merge items from selected templates with deduplication
        var mergedItems = new List<ChecklistItem>();
        var seenTexts = new HashSet<string>();
        var orderCounter = 0;

        foreach (var templateId in SelectedTemplateIds)
        {
            var template = Templates.FirstOrDefault(t => t.Id == templateId);
            if (template is null) continue;

            foreach (var item in template.Items)
            {
                if (seenTexts.Contains(item.Text)) continue;

                mergedItems.Add(new ChecklistItem
                {
                    Text = item.Text,
                    Order = orderCounter++,
                    SourceTemplate = template.Name,
                });

                seenTexts.Add(item.Text);
            }
        }

        var checklist = new Checklist
        {
            Name = name,
            UserId = GetUsername(),
            Items = mergedItems,
        };

        _db.Checklists.Add(checklist);
        await _db.SaveChangesAsync();

        return RedirectToPage("/Checklists/Detail", new { id = checklist.Id });
    }
}
