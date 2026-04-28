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
