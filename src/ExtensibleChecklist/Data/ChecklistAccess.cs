using Microsoft.EntityFrameworkCore;
using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Data;

/// <summary>
/// Access rules for checklists: the owner and everyone the checklist is
/// shared with may edit it, but only the owner may delete or manage shares.
/// </summary>
public static class ChecklistAccess
{
    /// <summary>Checklists <paramref name="username"/> may read and edit.</summary>
    public static IQueryable<Checklist> EditableBy(this IQueryable<Checklist> checklists, string username) =>
        checklists.Where(c => c.UserId == username || c.Shares.Any(s => s.UserId == username));

    /// <summary>Checklists <paramref name="username"/> may delete or share.</summary>
    public static IQueryable<Checklist> OwnedBy(this IQueryable<Checklist> checklists, string username) =>
        checklists.Where(c => c.UserId == username);

    /// <summary>Items belonging to a checklist <paramref name="username"/> may edit.</summary>
    public static IQueryable<ChecklistItem> EditableBy(this IQueryable<ChecklistItem> items, string username) =>
        items.Where(i => i.Checklist.UserId == username || i.Checklist.Shares.Any(s => s.UserId == username));

    /// <summary>Loads a checklist for editing, or null when the user has no access.</summary>
    public static Task<Checklist?> FindEditableAsync(this AppDbContext db, int checklistId, string username) =>
        db.Checklists.EditableBy(username).FirstOrDefaultAsync(c => c.Id == checklistId);

    /// <summary>Loads a checklist plus its items for editing, or null when the user has no access.</summary>
    public static Task<Checklist?> FindEditableWithItemsAsync(this AppDbContext db, int checklistId, string username) =>
        db.Checklists.EditableBy(username).Include(c => c.Items).FirstOrDefaultAsync(c => c.Id == checklistId);

    /// <summary>Loads an item for editing, or null when the user has no access to its checklist.</summary>
    public static Task<ChecklistItem?> FindEditableItemAsync(this AppDbContext db, int checklistId, int itemId, string username) =>
        db.ChecklistItems
            .EditableBy(username)
            .Include(i => i.Checklist)
            .FirstOrDefaultAsync(i => i.Id == itemId && i.ChecklistId == checklistId);
}
