using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages.Checklists;

public class DetailModel : PageModel
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _configuration;

    public Checklist? Checklist { get; set; }

    public DetailModel(AppDbContext db, IConfiguration configuration)
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

        Checklist = await _db.Checklists
            .Include(c => c.Items.OrderBy(i => i.Order))
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == GetUsername());

        if (Checklist is null)
            return RedirectToPage("/Index");

        return Page();
    }
}
