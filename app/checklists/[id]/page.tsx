"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  order: number;
  sourceTemplate: string;
}

interface Checklist {
  id: string;
  name: string;
  createdAt: string;
  items: ChecklistItem[];
}

interface GroupedItems {
  [templateName: string]: ChecklistItem[];
}

export default function ChecklistDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checklistId, setChecklistId] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<Checklist | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newItemText, setNewItemText] = useState("");
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  // Resolve params promise
  useEffect(() => {
    params.then((p) => setChecklistId(p.id));
  }, [params]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated" && checklistId) {
      fetchChecklist();
    }
  }, [status, router, checklistId]);

  async function fetchChecklist() {
    if (!checklistId) return;

    try {
      const response = await fetch("/api/checklists");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch checklist");
      }

      const checklists: Checklist[] = await response.json();
      const found = checklists.find((c) => c.id === checklistId);

      if (!found) {
        setError("Checklist not found");
        setLoading(false);
        return;
      }

      setChecklist(found);
    } catch (err) {
      setError("Failed to load checklist");
    } finally {
      setLoading(false);
    }
  }

  // Toggle item completion
  async function toggleCompletion(itemId: string, currentCompleted: boolean) {
    if (!checklist) return;

    // Optimistic update
    const updatedItems = checklist.items.map((item) =>
      item.id === itemId ? { ...item, completed: !currentCompleted } : item
    );
    setChecklist({ ...checklist, items: updatedItems });

    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          completed: !currentCompleted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item");
      }
    } catch (err) {
      // Revert on error
      setChecklist(checklist);
      setError("Failed to update item");
    }
  }

  // Update item text
  async function updateItemText(itemId: string, newText: string) {
    if (!checklist) return;
    if (!newText.trim()) {
      // Don't allow empty text, revert to original
      fetchChecklist();
      return;
    }

    try {
      // For text editing, we'll use PATCH but with text field
      // Since the API only supports completion toggle, we need to add text editing support
      // For now, just update locally - we'll need to extend the API
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          text: newText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update item text");
      }

      // Update local state
      const updatedItems = checklist.items.map((item) =>
        item.id === itemId ? { ...item, text: newText.trim() } : item
      );
      setChecklist({ ...checklist, items: updatedItems });
    } catch (err) {
      setError("Failed to update item text");
      // Revert to original
      fetchChecklist();
    }
  }

  // Delete item
  async function deleteItem(itemId: string, itemText: string) {
    if (!checklist) return;
    if (!confirm(`Delete "${itemText}"?`)) return;

    // Optimistic update
    const updatedItems = checklist.items.filter((item) => item.id !== itemId);
    setChecklist({ ...checklist, items: updatedItems });

    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId }),
      });

      if (!response.ok) {
        throw new Error("Failed to delete item");
      }
    } catch (err) {
      // Revert on error
      setChecklist(checklist);
      setError("Failed to delete item");
    }
  }

  // Reorder items (swap with adjacent)
  async function moveItem(itemId: string, direction: "up" | "down") {
    if (!checklist) return;

    const items = [...checklist.items].sort((a, b) => a.order - b.order);
    const index = items.findIndex((item) => item.id === itemId);

    if (index === -1) return;
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === items.length - 1) return;

    const swapIndex = direction === "up" ? index - 1 : index + 1;

    // Swap orders
    const newOrder = [...items];
    [newOrder[index], newOrder[swapIndex]] = [newOrder[swapIndex], newOrder[index]];

    // Renumber all items
    const updates = newOrder.map((item, idx) => ({
      itemId: item.id,
      order: idx,
    }));

    // Optimistic update
    const updatedItems = checklist.items.map((item) => {
      const update = updates.find((u) => u.itemId === item.id);
      return update ? { ...item, order: update.order } : item;
    });
    setChecklist({ ...checklist, items: updatedItems });

    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      });

      if (!response.ok) {
        throw new Error("Failed to reorder items");
      }
    } catch (err) {
      // Revert on error
      setChecklist(checklist);
      setError("Failed to reorder items");
    }
  }

  // Add new item
  async function addItem(e: React.FormEvent) {
    e.preventDefault();
    if (!checklist || !newItemText.trim()) return;

    const tempId = `temp-${Date.now()}`;
    const maxOrder = checklist.items.length > 0
      ? Math.max(...checklist.items.map(i => i.order))
      : -1;

    // Optimistic update
    const newItem: ChecklistItem = {
      id: tempId,
      text: newItemText.trim(),
      completed: false,
      order: maxOrder + 1,
      sourceTemplate: "Custom",
    };
    setChecklist({
      ...checklist,
      items: [...checklist.items, newItem],
    });
    setNewItemText("");

    try {
      const response = await fetch(`/api/checklists/${checklistId}/items`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: newItemText.trim() }),
      });

      if (!response.ok) {
        throw new Error("Failed to add item");
      }

      const createdItem = await response.json();

      // Replace temp item with real item using functional state update
      setChecklist((currentChecklist) => {
        if (!currentChecklist) return currentChecklist;
        const updatedItems = currentChecklist.items.map((item) =>
          item.id === tempId ? createdItem : item
        );
        return { ...currentChecklist, items: updatedItems };
      });
    } catch (err) {
      // Remove temp item on error using functional state update
      setChecklist((currentChecklist) => {
        if (!currentChecklist) return currentChecklist;
        const updatedItems = currentChecklist.items.filter((item) => item.id !== tempId);
        return { ...currentChecklist, items: updatedItems };
      });
      setError("Failed to add item");
    }
  }

  // Group items by source template
  function groupItemsByTemplate(items: ChecklistItem[]): GroupedItems {
    const sorted = [...items].sort((a, b) => a.order - b.order);
    const grouped: GroupedItems = {};

    sorted.forEach((item) => {
      const templateName = item.sourceTemplate || "Unknown";
      if (!grouped[templateName]) {
        grouped[templateName] = [];
      }
      grouped[templateName].push(item);
    });

    return grouped;
  }

  // Calculate progress
  function calculateProgress() {
    if (!checklist) return { total: 0, completed: 0, percentage: 0 };

    const total = checklist.items.length;
    const completed = checklist.items.filter((item) => item.completed).length;
    const percentage = total > 0 ? (completed / total) * 100 : 0;

    return { total, completed, percentage };
  }

  // Toggle group collapse
  function toggleGroup(templateName: string) {
    setCollapsed({
      ...collapsed,
      [templateName]: !collapsed[templateName],
    });
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </main>
    );
  }

  if (error && !checklist) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
            {error}
          </h1>
          <Link
            href="/checklists"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Back to Checklists
          </Link>
        </div>
      </main>
    );
  }

  if (!checklist) {
    return null;
  }

  const { total, completed, percentage } = calculateProgress();
  const grouped = groupItemsByTemplate(checklist.items);

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        {/* Header with progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              {checklist.name}
            </h1>
            <Link
              href="/checklists"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Back to Checklists
            </Link>
          </div>

          {/* Progress display */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span className="font-medium">
                {completed} of {total} items completed
              </span>
              <span className="font-medium">{Math.round(percentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Grouped items */}
        <div className="space-y-6">
          {Object.entries(grouped).map(([templateName, items]) => (
            <div
              key={templateName}
              className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden"
            >
              {/* Group header */}
              <button
                onClick={() => toggleGroup(templateName)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {templateName}
                </h2>
                <span className="text-gray-500 dark:text-gray-400 text-xl">
                  {collapsed[templateName] ? "▶" : "▼"}
                </span>
              </button>

              {/* Group items */}
              {!collapsed[templateName] && (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {items.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isLast = idx === items.length - 1;

                    return (
                      <div
                        key={item.id}
                        className="p-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() =>
                              toggleCompletion(item.id, item.completed)
                            }
                            className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                          />

                          {/* Item text (editable) */}
                          <input
                            type="text"
                            value={item.text}
                            onChange={(e) => {
                              // Update local state immediately for responsive typing
                              const updatedItems = checklist.items.map((i) =>
                                i.id === item.id ? { ...i, text: e.target.value } : i
                              );
                              setChecklist({ ...checklist, items: updatedItems });
                            }}
                            onBlur={(e) => updateItemText(item.id, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                              }
                            }}
                            className={`flex-1 px-2 py-1 border border-transparent hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded bg-transparent ${
                              item.completed
                                ? "line-through text-gray-500 dark:text-gray-400"
                                : "text-gray-900 dark:text-white"
                            }`}
                          />

                          {/* Reorder buttons */}
                          <div className="flex flex-col gap-1">
                            <button
                              onClick={() => moveItem(item.id, "up")}
                              disabled={isFirst}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                              title="Move up"
                            >
                              ▲
                            </button>
                            <button
                              onClick={() => moveItem(item.id, "down")}
                              disabled={isLast}
                              className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed text-sm"
                              title="Move down"
                            >
                              ▼
                            </button>
                          </div>

                          {/* Delete button */}
                          <button
                            onClick={() => deleteItem(item.id, item.text)}
                            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-2 py-1"
                            title="Delete item"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new item form */}
        <form onSubmit={addItem} className="mt-8">
          <div className="flex gap-3">
            <input
              type="text"
              value={newItemText}
              onChange={(e) => setNewItemText(e.target.value)}
              placeholder="Add a new item..."
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
            <button
              type="submit"
              disabled={!newItemText.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Item
            </button>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            Press Enter or click "Add Item" to add
          </p>
        </form>
      </div>
    </main>
  );
}
