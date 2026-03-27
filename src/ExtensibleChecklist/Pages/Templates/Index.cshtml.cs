using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages.Templates;

public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public List<Template> Templates { get; set; } = [];

    public IndexModel(AppDbContext db, IConfiguration configuration)
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

    public async Task<IActionResult> OnPostDeleteAsync(int id)
    {
        var template = await _db.Templates.FirstOrDefaultAsync(t => t.Id == id && t.UserId == GetUsername());
        if (template != null)
        {
            _db.Templates.Remove(template);
            await _db.SaveChangesAsync();
        }
        return RedirectToPage();
    }
}
