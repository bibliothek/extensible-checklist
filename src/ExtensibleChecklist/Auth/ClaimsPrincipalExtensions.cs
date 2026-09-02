using System.Security.Claims;

namespace ExtensibleChecklist.Auth;

public static class ClaimsPrincipalExtensions
{
    /// <summary>
    /// The identity used as the owner/share key for all stored data.
    /// </summary>
    public static string? GetUsername(this ClaimsPrincipal user) =>
        user.FindFirstValue("preferred_username")
        ?? user.FindFirstValue("name")
        ?? user.FindFirstValue(ClaimTypes.Name)
        ?? user.Identity?.Name;

    /// <summary>
    /// Friendly name for display, falling back to the username.
    /// </summary>
    public static string? GetDisplayName(this ClaimsPrincipal user) =>
        user.FindFirstValue("name") ?? user.GetUsername();
}
