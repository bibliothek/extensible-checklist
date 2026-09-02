using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Auth;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;
using ExtensibleChecklist.Services;

namespace ExtensibleChecklist.Pages.Checklists;

public class DetailModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;
    private readonly UserDirectory _users;

    public Checklist? Checklist { get; set; }

    /// <summary>True when the signed-in user owns the checklist, and so may share or delete it.</summary>
    public bool IsOwner { get; set; }

    /// <summary>Display name of the owner, shown to users the checklist was shared with.</summary>
    public string OwnerDisplayName { get; set; } = "";

    /// <summary>Every other user in the system, offered in the share picker (owner only).</summary>
    public List<UserOption> ShareCandidates { get; set; } = [];

    /// <summary>Usernames the checklist is currently shared with.</summary>
    public HashSet<string> SharedWith { get; set; } = new(StringComparer.OrdinalIgnoreCase);

    public DetailModel(AppDbContext db, IConfiguration configuration, UserDirectory users)
    {
        _db = db;
        _configuration = configuration;
        _users = users;
    }

    public async Task<IActionResult> OnGetAsync(int id)
    {
        ViewData["OidcIssuer"] = _configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";

        var username = User.GetUsername() ?? "unknown";

        Checklist = await _db.Checklists
            .EditableBy(username)
            .Include(c => c.Items.OrderBy(i => i.Order))
            .Include(c => c.Shares)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (Checklist is null)
            return RedirectToPage("/Index");

        IsOwner = string.Equals(Checklist.UserId, username, StringComparison.OrdinalIgnoreCase);
        SharedWith = Checklist.Shares.Select(s => s.UserId).ToHashSet(StringComparer.OrdinalIgnoreCase);

        if (IsOwner)
        {
            ShareCandidates = await _users.GetOtherUsersAsync(username);
        }
        else
        {
            OwnerDisplayName = await _users.GetDisplayNameAsync(Checklist.UserId);
        }

        return Page();
    }
}
