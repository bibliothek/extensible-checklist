using ExtensibleChecklist.Models;

namespace ExtensibleChecklist.Pages;

/// <summary>
/// A checklist as shown on the dashboard, together with the viewer's
/// relationship to it: owners may delete, shared users may only leave.
/// </summary>
public record ChecklistCardViewModel(Checklist Checklist, bool IsOwner, string? SharedByDisplayName);
