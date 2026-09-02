namespace ExtensibleChecklist.Models;

/// <summary>
/// Directory of users known to this app, recorded on sign-in so that
/// checklists can be shared with people who have not created anything yet.
/// </summary>
public class AppUser
{
    /// <summary>The identity used as owner/share key everywhere else (preferred_username).</summary>
    public string Username { get; set; } = "";
    public string? DisplayName { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastSeenAt { get; set; } = DateTime.UtcNow;
}
