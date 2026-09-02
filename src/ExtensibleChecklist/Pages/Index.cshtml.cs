using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Auth;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;
using ExtensibleChecklist.Services;

namespace ExtensibleChecklist.Pages;

public class IndexModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly UserDirectory _users;

    /// <summary>Checklists the current user owns.</summary>
    public List<Checklist> Checklists { get; set; } = [];

    /// <summary>Checklists other users have shared with the current user.</summary>
    public List<Checklist> SharedWithMe { get; set; } = [];

    /// <summary>Display names for the owners of <see cref="SharedWithMe"/>.</summary>
    public Dictionary<string, string> OwnerNames { get; set; } = [];

    public IndexModel(AppDbContext db, IConfiguration configuration, UserDirectory users)
    {
        _db = db;
        _configuration = configuration;
        _users = users;
    }

    public async Task OnGetAsync()
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.GetUsername() ?? "unknown";

        Checklists = await _db.Checklists
            .OwnedBy(username)
            .Include(c => c.Items)
            .Include(c => c.Shares)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        SharedWithMe = await _db.Checklists
            .Where(c => c.UserId != username && c.Shares.Any(s => s.UserId == username))
            .Include(c => c.Items)
            .Include(c => c.Shares)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        foreach (var owner in SharedWithMe.Select(c => c.UserId).Distinct())
        {
            OwnerNames[owner] = await _users.GetDisplayNameAsync(owner);
        }
    }

    /// <summary>Deleting a checklist is reserved for its owner.</summary>
    public async Task<IActionResult> OnPostDeleteAsync(int id)
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.GetUsername();
        if (string.IsNullOrEmpty(username)) return RedirectToPage();

        var checklist = await _db.Checklists.OwnedBy(username).FirstOrDefaultAsync(c => c.Id == id);
        if (checklist != null)
        {
            _db.Checklists.Remove(checklist);
            await _db.SaveChangesAsync();
        }

        return RedirectToPage();
    }

    /// <summary>
    /// Gives up access to a checklist shared with the current user. This only
    /// removes their own share — the checklist itself stays with the owner.
    /// </summary>
    public async Task<IActionResult> OnPostLeaveAsync(int id)
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.GetUsername();
        if (string.IsNullOrEmpty(username)) return RedirectToPage();

        var share = await _db.ChecklistShares
            .FirstOrDefaultAsync(s => s.ChecklistId == id && s.UserId == username);

        if (share != null)
        {
            _db.ChecklistShares.Remove(share);
            await _db.SaveChangesAsync();
        }

        return RedirectToPage();
    }
}
