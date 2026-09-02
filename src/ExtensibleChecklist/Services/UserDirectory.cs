using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Services;

/// <summary>A user that a checklist can be shared with.</summary>
public record UserOption(string Username, string DisplayName);

/// <summary>
/// Keeps track of the users known to this app so that the share picker can
/// offer everyone, not just people who happen to own a checklist already.
/// </summary>
public class UserDirectory
{
    private readonly AppDbContext _db;
    private readonly ILogger<UserDirectory> _logger;

    public UserDirectory(AppDbContext db, ILogger<UserDirectory> logger)
    {
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Records a user as seen. Called on sign-in; failures are logged and
    /// swallowed so that a directory hiccup never blocks logging in.
    /// </summary>
    public async Task TouchAsync(string username, string? displayName, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(username)) return;
        username = username.Trim();

        try
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == username, ct);
            var now = DateTime.UtcNow;

            if (user is null)
            {
                _db.Users.Add(new AppUser
                {
                    Username = username,
                    DisplayName = string.IsNullOrWhiteSpace(displayName) ? null : displayName.Trim(),
                    CreatedAt = now,
                    LastSeenAt = now,
                });
            }
            else
            {
                if (!string.IsNullOrWhiteSpace(displayName)) user.DisplayName = displayName.Trim();
                user.LastSeenAt = now;
            }

            await _db.SaveChangesAsync(ct);
        }
        catch (Exception ex)
        {
            // Two concurrent sign-ins can race on the insert; the loser just
            // skips the update, which the next sign-in fixes up.
            _logger.LogWarning(ex, "Could not record user {Username} in the directory", username);
        }
    }

    /// <summary>
    /// Everyone in the system except <paramref name="currentUsername"/>, ordered by display name.
    /// Includes users who signed in but also owners found in existing data, so
    /// the picker is complete even for accounts that predate the directory.
    /// </summary>
    public async Task<List<UserOption>> GetOtherUsersAsync(string currentUsername, CancellationToken ct = default)
    {
        var registered = await _db.Users
            .Select(u => new { u.Username, u.DisplayName })
            .ToListAsync(ct);

        var checklistOwners = await _db.Checklists.Select(c => c.UserId).Distinct().ToListAsync(ct);
        var templateOwners = await _db.Templates.Select(t => t.UserId).Distinct().ToListAsync(ct);
        var shareRecipients = await _db.ChecklistShares.Select(s => s.UserId).Distinct().ToListAsync(ct);

        var displayNames = registered
            .Where(u => !string.IsNullOrWhiteSpace(u.DisplayName))
            .ToDictionary(u => u.Username, u => u.DisplayName!, StringComparer.OrdinalIgnoreCase);

        return registered.Select(u => u.Username)
            .Concat(checklistOwners)
            .Concat(templateOwners)
            .Concat(shareRecipients)
            .Where(u => !string.IsNullOrWhiteSpace(u))
            .Select(u => u.Trim())
            .Where(u => !string.Equals(u, currentUsername, StringComparison.OrdinalIgnoreCase))
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Select(u => new UserOption(u, displayNames.TryGetValue(u, out var name) ? name : u))
            .OrderBy(u => u.DisplayName, StringComparer.OrdinalIgnoreCase)
            .ThenBy(u => u.Username, StringComparer.OrdinalIgnoreCase)
            .ToList();
    }

    /// <summary>Resolves a display name for a single username.</summary>
    public async Task<string> GetDisplayNameAsync(string username, CancellationToken ct = default)
    {
        var name = await _db.Users
            .Where(u => u.Username == username)
            .Select(u => u.DisplayName)
            .FirstOrDefaultAsync(ct);

        return string.IsNullOrWhiteSpace(name) ? username : name;
    }
}
