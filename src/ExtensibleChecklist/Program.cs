using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.OpenIdConnect;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Logging;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using ExtensibleChecklist.Data;
using ExtensibleChecklist.Models;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    IdentityModelEventSource.ShowPII = true;
}

builder.Services.AddRazorPages();

// Entity Framework with SQLite
var connectionString = builder.Configuration.GetConnectionString("Default") ?? "Data Source=data/checklist.db";
builder.Services.AddDbContext<AppDbContext>(options => options.UseSqlite(connectionString));

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

// Health endpoint (no auth)
app.MapGet("/api/health", () => Results.Ok(new { status = "healthy" }));

// ---- API Endpoints for interactive checklist operations ----

string? GetUsername(HttpContext ctx) =>
    ctx.User.FindFirstValue("preferred_username")
    ?? ctx.User.FindFirstValue("name")
    ?? ctx.User.FindFirstValue(ClaimTypes.Name)
    ?? ctx.User.Identity?.Name;

var api = app.MapGroup("/api")
    .RequireAuthorization()
    .DisableAntiforgery();

// Toggle item completion
api.MapPost("/checklists/{checklistId}/items/{itemId}/toggle", async (int checklistId, int itemId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var item = await db.ChecklistItems
        .Include(i => i.Checklist)
        .FirstOrDefaultAsync(i => i.Id == itemId && i.ChecklistId == checklistId && i.Checklist.UserId == username);

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

    var item = await db.ChecklistItems
        .Include(i => i.Checklist)
        .FirstOrDefaultAsync(i => i.Id == itemId && i.ChecklistId == checklistId && i.Checklist.UserId == username);

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

    var checklist = await db.Checklists
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.Id == checklistId && c.UserId == username);

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

    var item = await db.ChecklistItems
        .Include(i => i.Checklist)
        .FirstOrDefaultAsync(i => i.Id == itemId && i.ChecklistId == checklistId && i.Checklist.UserId == username);

    if (item is null) return Results.NotFound();

    db.ChecklistItems.Remove(item);
    item.Checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Ok();
});

// Reorder items
api.MapPost("/checklists/{checklistId}/reorder", async (int checklistId, ReorderRequest body, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.Checklists
        .Include(c => c.Items)
        .FirstOrDefaultAsync(c => c.Id == checklistId && c.UserId == username);

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

// Toggle hideCompleted
api.MapPost("/checklists/{checklistId}/hide-completed", async (int checklistId, AppDbContext db, HttpContext ctx) =>
{
    var username = GetUsername(ctx);
    if (string.IsNullOrEmpty(username)) return Results.Unauthorized();

    var checklist = await db.Checklists.FirstOrDefaultAsync(c => c.Id == checklistId && c.UserId == username);
    if (checklist is null) return Results.NotFound();

    checklist.HideCompleted = !checklist.HideCompleted;
    checklist.UpdatedAt = DateTime.UtcNow;
    await db.SaveChangesAsync();

    return Results.Json(new { checklist.HideCompleted });
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
