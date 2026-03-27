using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages.Templates;

public class EditModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    [BindProperty]
    public string Name { get; set; } = "";

    [BindProperty]
    public string ItemsText { get; set; } = "";

    [BindProperty]
    public int TemplateId { get; set; }

    public string? ErrorMessage { get; set; }

    public EditModel(AppDbContext db, IConfiguration configuration)
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

    public async Task<IActionResult> OnGetAsync(int id)
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var template = await _db.Templates
            .Include(t => t.Items.OrderBy(i => i.Order))
            .FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUsername());

        if (template is null)
            return RedirectToPage("/Templates/Index");

        TemplateId = template.Id;
        Name = template.Name;
        ItemsText = string.Join("\n", template.Items.Select(i => i.Text));

        return Page();
    }

    public async Task<IActionResult> OnPostAsync()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        if (string.IsNullOrWhiteSpace(Name))
        {
            ErrorMessage = "Template name is required.";
            return Page();
        }

        var lines = (ItemsText ?? "")
            .Split('\n')
            .Select(l => l.Trim().TrimStart('-').Trim())
            .Where(l => l.Length > 0)
            .ToList();

        if (lines.Count == 0)
        {
            ErrorMessage = "At least one item is required.";
            return Page();
        }

        var template = await _db.Templates
            .Include(t => t.Items)
            .FirstOrDefaultAsync(t => t.Id == TemplateId && t.UserId == GetUsername());

        if (template is null)
            return RedirectToPage("/Templates/Index");

        template.Name = Name.Trim();
        template.UpdatedAt = DateTime.UtcNow;

        // Replace all items
        _db.TemplateItems.RemoveRange(template.Items);
        template.Items = lines.Select((text, i) => new TemplateItem
        {
            Text = text,
            Order = i,
            TemplateId = template.Id,
        }).ToList();

        await _db.SaveChangesAsync();

        return RedirectToPage("/Templates/Index");
    }
}
