using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages;

public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public List<Checklist> Checklists { get; set; } = [];

    public IndexModel(AppDbContext db, IConfiguration configuration)
    {
        _db = db;
        _configuration = configuration;
    }

    public async Task OnGetAsync()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.FindFirstValue("preferred_username")
            ?? User.FindFirstValue("name")
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.Identity?.Name
            ?? "unknown";

        Checklists = await _db.Checklists
            .Where(c => c.UserId == username)
            .Include(c => c.Items)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();
    }

    public async Task<IActionResult> OnPostDeleteAsync(int id)
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.FindFirstValue("preferred_username")
            ?? User.FindFirstValue("name")
            ?? User.FindFirstValue(ClaimTypes.Name)
            ?? User.Identity?.Name;

        var checklist = await _db.Checklists.FirstOrDefaultAsync(c => c.Id == id && c.UserId == username);
        if (checklist != null)
        {
            _db.Checklists.Remove(checklist);
            await _db.SaveChangesAsync();
        }

        return RedirectToPage();
    }
}
