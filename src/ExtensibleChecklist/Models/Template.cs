namespace ExtensibleChecklist.Models;

public class Template
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string UserId { get; set; } = "";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public List<TemplateItem> Items { get; set; } = [];
}

public class TemplateItem
{
    public int Id { get; set; }
    public string Text { get; set; } = "";
    public int Order { get; set; }
    public int TemplateId { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public Template Template { get; set; } = null!;
}
