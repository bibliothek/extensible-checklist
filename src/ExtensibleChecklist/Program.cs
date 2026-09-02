using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using ExtensibleChecklist.Auth;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;
using ExtensibleChecklist.Services;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    IdentityModelEventSource.ShowPII = true;
}

builder.Services.AddRazorPages();

// Entity Framework with SQLite
var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=data/checklist.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

builder.Services.AddScoped<UserDirectory>();

// OIDC Authentication (same pattern as matha-hub)
var oidcIssuer = builder.Configuration["OIDC_ISSUER"] ?? "http://localhost:5001/";
var oidcIssuerInternal = builder.Configuration["OIDC_ISSUER_INTERNAL"] ?? oidcIssuer;
var oidcClientId = builder.Configuration["OIDC_CLIENT_ID"] ?? "extensible-checklist";
var oidcClientSecret = builder.Configuration["OIDC_CLIENT_SECRET"] ?? "extensible-checklist-secret";

builder.Services.AddAuthentication(options =>
{
    options.DefaultScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = OpenIdConnectDefaults.AuthenticationScheme;
})
.AddCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.SlidingExpiration = true;
    options.Events.OnSigningIn = context =>
    {
        context.Properties.IsPersistent = true;
        return Task.CompletedTask;
    };
})
.AddOpenIdConnect(options =>
{
    options.RequireHttpsMetadata = !builder.Environment.IsDevelopment();
    options.Authority = oidcIssuerInternal.TrimEnd('/');
    options.ClientId = oidcClientId;
    options.ClientSecret = oidcClientSecret;
    options.ResponseType = OpenIdConnectResponseType.Code;
    options.SaveTokens = true;
    options.GetClaimsFromUserInfoEndpoint = true;
    options.Scope.Clear();
    options.Scope.Add("openid");
    options.Scope.Add("profile");

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidIssuer = oidcIssuer.TrimEnd('/'),
        NameClaimType = "preferred_username",
    };

    if (oidcIssuerInternal != oidcIssuer)
    {
        options.TokenValidationParameters.ValidIssuers = [
            oidcIssuer.TrimEnd('/'),
            oidcIssuerInternal.TrimEnd('/'),
            oidcIssuer.TrimEnd('/') + "/",
            oidcIssuerInternal.TrimEnd('/') + "/",
        ];
    }

    options.Events = new OpenIdConnectEvents
    {
        OnTicketReceived = async context =>
        {
            var username = context.Principal?.GetUsername();
            if (!string.IsNullOrWhiteSpace(username))
            {
                var directory = context.HttpContext.RequestServices.GetRequiredService<UserDirectory>();
                await directory.TouchAsync(username, context.Principal?.GetDisplayName());
            }
        },
        OnRedirectToIdentityProvider = context =>
        {
            var publicAuthority = oidcIssuer.TrimEnd('/');
            context.ProtocolMessage.IssuerAddress = context.ProtocolMessage.IssuerAddress
                .Replace(oidcIssuerInternal.TrimEnd('/'), publicAuthority);
            return Task.CompletedTask;
        },
        OnRedirectToIdentityProviderForSignOut = context =>
        {
            var publicAuthority = oidcIssuer.TrimEnd('/');
            context.ProtocolMessage.IssuerAddress = context.ProtocolMessage.IssuerAddress
                .Replace(oidcIssuerInternal.TrimEnd('/'), publicAuthority);
            context.ProtocolMessage.PostLogoutRedirectUri =
                $"{context.Request.Scheme}://{context.Request.Host}";
            return Task.CompletedTask;
        },
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Auto-migrate database
try
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var dbPath = db.Database.GetConnectionString()?.Replace("Data Source=", "");
    if (!string.IsNullOrEmpty(dbPath))
    {
        var dir = Path.GetDirectoryName(dbPath);
        if (!string.IsNullOrEmpty(dir)) Directory.CreateDirectory(dir);
    }
    db.Database.Migrate();
}
catch (Exception ex)
{
    app.Logger.LogError(ex, "Database migration failed");
}

var forwardedHeadersOptions = new ForwardedHeadersOptions
{
    ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto
};
forwardedHeadersOptions.KnownIPNetworks.Clear();
forwardedHeadersOptions.KnownProxies.Clear();
app.UseForwardedHeaders(forwardedHeadersOptions);

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error");
}

app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

// Logout: clear local cookie, then redirect to OIDC logout
app.MapGet("/logout", async (HttpContext ctx) =>
{
    await ctx.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
    await ctx.SignOutAsync(OpenIdConnectDefaults.AuthenticationScheme);
}).AllowAnonymous();

// Health endpoint (no auth)
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

// ---- API Endpoints for interactive checklist operations ----

string? GetUsername(HttpContext ctx) => ctx.User.GetUsername();

var api = app.MapGroup("/api")
    .RequireAuthorization()
    .DisableAntiforgery();

// Toggle item completion
api.MapPost("/checklists/{checklistId}/items/{itemId}/toggle", async (int checklistId, int itemId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var item = await db.FindEditableItemAsync(checklistId, itemId, username);

    if (item is null) return Results.NotFound();

    item.Completed = !item.Completed;
    item.Checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { item.Id, item.Completed });
});

// Update item text
api.MapPost("/checklists/{checklistId}/items/{itemId}/text", async (int checklistId, int itemId, TextUpdate body, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var item = await db.FindEditableItemAsync(checklistId, itemId, username);

    if (item is null) return Results.NotFound();

    item.Text = body.Text.Trim();
    item.Checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { item.Id, item.Text });
});

// Add item to checklist
api.MapPost("/checklists/{checklistId}/items", async (int checklistId, AddItemRequest body, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.FindEditableWithItemsAsync(checklistId, username);

    if (checklist is null) return Results.NotFound();

    var maxOrder = checklist.Items.Count > 0 ? checklist.Items.Max(i => i.Order) : -1;

    var item = new ChecklistItem
    {
        Text = body.Text.Trim(),
        Order = maxOrder + 1,
        SourceTemplate = string.IsNullOrWhiteSpace(body.SourceTemplate) ? "Custom" : body.SourceTemplate.Trim(),
        ChecklistId = checklistId,
    };

    db.ChecklistItems.Add(item);
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { item.Id, item.Text, item.Completed, item.Order, item.SourceTemplate });
});

// Delete item from checklist
api.MapDelete("/checklists/{checklistId}/items/{itemId}", async (int checklistId, int itemId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var item = await db.FindEditableItemAsync(checklistId, itemId, username);

    if (item is null) return Results.NotFound();

    db.ChecklistItems.Remove(item);
    item.Checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Delete group from checklist
api.MapDelete("/checklists/{checklistId}/groups", async (int checklistId, string groupName, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    groupName = groupName.Trim();
    if (string.IsNullOrEmpty(groupName)) return Results.BadRequest(new { error = "Group name cannot be empty" });

    var checklist = await db.FindEditableWithItemsAsync(checklistId, username);

    if (checklist is null) return Results.NotFound();

    var items = checklist.Items.Where(i => i.SourceTemplate == groupName).ToList();
    db.ChecklistItems.RemoveRange(items);
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Reorder items
api.MapPost("/checklists/{checklistId}/reorder", async (int checklistId, ReorderRequest body, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.FindEditableWithItemsAsync(checklistId, username);

    if (checklist is null) return Results.NotFound();

    var itemMap = checklist.Items.ToDictionary(i => i.Id);
    foreach (var update in body.Updates)
    {
        if (itemMap.TryGetValue(update.ItemId, out var item))
        {
            item.Order = update.Order;
        }
    }

    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Update checklist name
api.MapPost("/checklists/{checklistId}/name", async (int checklistId, TextUpdate body, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var name = body.Text.Trim();
    if (string.IsNullOrEmpty(name)) return Results.BadRequest(new { error = "Name cannot be empty" });

    var checklist = await db.FindEditableAsync(checklistId, username);
    if (checklist is null) return Results.NotFound();

    checklist.Name = name;
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { checklist.Id, checklist.Name });
});

// Toggle hideCompleted
api.MapPost("/checklists/{checklistId}/hide-completed", async (int checklistId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.FindEditableAsync(checklistId, username);
    if (checklist is null) return Results.NotFound();

    checklist.HideCompleted = !checklist.HideCompleted;
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { checklist.HideCompleted });
});

// Toggle hideProgress
api.MapPost("/checklists/{checklistId}/hide-progress", async (int checklistId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.FindEditableAsync(checklistId, username);
    if (checklist is null) return Results.NotFound();

    checklist.HideProgress = !checklist.HideProgress;
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { checklist.HideProgress });
});

// ---- Sharing (owner only) ----

// Replace the set of users a checklist is shared with
api.MapPost("/checklists/{checklistId}/shares", async (int checklistId, ShareRequest body, AppDbContext db, UserDirectory directory, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.Checklists
        .OwnedBy(username)
        .Include(c => c.Shares)
        .FirstOrDefaultAsync(c => c.Id == checklistId);

    if (checklist is null) return Results.NotFound();

    // Only users that actually exist in the system can be granted access,
    // and the owner is never stored as a share.
    var known = (await directory.GetOtherUsersAsync(username))
        .ToDictionary(u => u.Username, StringComparer.OrdinalIgnoreCase);

    var requested = (body.Usernames ?? [])
        .Where(u => !string.IsNullOrWhiteSpace(u))
        .Select(u => u.Trim())
        .Distinct(StringComparer.OrdinalIgnoreCase)
        .ToList();

    var unknown = requested.Where(u => !known.ContainsKey(u)).ToList();
    if (unknown.Count > 0)
        return Results.BadRequest(new { error = $"Unknown user(s): {string.Join(", ", unknown)}" });

    // Normalise to the directory's casing so comparisons stay stable.
    var target = requested.Select(u => known[u].Username).ToList();

    var removed = checklist.Shares
        .Where(s => !target.Contains(s.UserId, StringComparer.OrdinalIgnoreCase))
        .ToList();
    db.ChecklistShares.RemoveRange(removed);

    foreach (var user in target)
    {
        if (checklist.Shares.Any(s => string.Equals(s.UserId, user, StringComparison.OrdinalIgnoreCase)))
            continue;

        db.ChecklistShares.Add(new ChecklistShare
        {
            ChecklistId = checklist.Id,
            UserId = user,
            SharedBy = username,
        });
    }

    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { sharedWith = target });
});

// Export templates as markdown
api.MapGet("/templates/export", async (AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var templates = await db.Templates
        .Where(t => t.UserId == username)
        .Include(t => t.Items.OrderBy(i => i.Order))
        .OrderByDescending(t => t.CreatedAt)
        .ToListAsync();

    var markdown = "";
    foreach (var template in templates)
    {
        markdown += $"## {template.Name}\n\n";
        foreach (var item in template.Items)
        {
            markdown += $"- [ ] {item.Text}\n";
        }
        markdown += "\n";
    }

    var timestamp = DateTime.UtcNow.ToString("yyyy-MM-dd-HHmmss");
    var filename = $"templates-{timestamp}.md";

    return Results.File(
        System.Text.Encoding.UTF8.GetBytes(markdown),
        "text/markdown",
        filename);
});

app.MapRazorPages().RequireAuthorization();

app.Run();

// Request DTOs
record TextUpdate(string Text);
record AddItemRequest(string Text, string? SourceTemplate);
record ReorderUpdate(int ItemId, int Order);
record ReorderRequest(List<ReorderUpdate> Updates);
record ShareRequest(List<string>? Usernames);
