namespace ExtensibleChecklist.Models;

public class Checklist
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string UserId { get; set; } = "";
    public bool HideCompleted { get; set; }
    public bool HideProgress { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<ChecklistItem> Items { get; set; } = [];
    public List<ChecklistShare> Shares { get; set; } = [];
}

public class ChecklistItem
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    public bool Completed { get; set; }
    public int Order { get; set; }
    public string SourceTemplate { get; set; } = "Custom";
    public int ChecklistId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Checklist Checklist { get; set; } = null!;
}

/// <summary>
/// Grants a non-owner edit access to a checklist. The owner
/// (<see cref="Checklist.UserId"/>) is never stored as a share.
/// </summary>
public class ChecklistShare
{
    public int Id { get; set; }
    public int ChecklistId { get; set; }
    /// <summary>Username the checklist is shared with.</summary>
    public string UserId { get; set; } = "";
    /// <summary>Username that created the share (the owner at the time).</summary>
    public string SharedBy { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Checklist Checklist { get; set; } = null!;
}
