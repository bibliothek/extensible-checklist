using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages.Templates;

public class CreateModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    [BindProperty]
    public string Name { get; set; } = "";

    [BindProperty]
    public string ItemsText { get; set; } = "";

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

    public void OnGet()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";
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

        var template = new Template
        {
            Name = Name.Trim(),
            UserId = GetUsername(),
            Items = lines.Select((text, i) => new TemplateItem
            {
                Text = text,
                Order = i,
            }).ToList(),
        };

        _db.Templates.Add(template);
        await _db.SaveChangesAsync();

        return RedirectToPage("/Templates/Index");
    }
}
