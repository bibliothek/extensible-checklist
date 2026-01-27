"use client";

import { useState, FormEvent, KeyboardEvent } from "react";

interface TemplateItem {
  id: string;
  text: string;
  order: number;
}

interface TemplateFormProps {
  initialData?: {
    name: string;
    items: TemplateItem[];
  };
  onSubmit: (data: { name: string; items: { text: string; order: number }[] }) => Promise<void>;
  onCancel: () => void;
}

export default function TemplateForm({ initialData, onSubmit, onCancel }: TemplateFormProps) {
  const [name, setName] = useState(initialData?.name || "");
  const [items, setItems] = useState<TemplateItem[]>(
    initialData?.items || []
  );
  const [newItemText, setNewItemText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");

  // Add item via button or Enter key
  function addItem() {
    if (!newItemText.trim()) return;

    const newItem: TemplateItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      order: items.length,
    };

    setItems([...items, newItem]);
    setNewItemText("");
  }

  // Handle Enter key in new item input
  function handleNewItemKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      e.preventDefault();
      addItem();
    }
  }

  // Remove item and renumber
  function removeItem(id: string) {
    const filtered = items.filter(item => item.id !== id);
    // Renumber order
    const renumbered = filtered.map((item, index) => ({
      ...item,
      order: index,
    }));
    setItems(renumbered);
  }

  // Move item up
  function moveUp(index: number) {
    if (index === 0) return;
    const newItems = [...items];
    [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
    // Renumber order
    const renumbered = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    setItems(renumbered);
  }

  // Move item down
  function moveDown(index: number) {
    if (index === items.length - 1) return;
    const newItems = [...items];
    [newItems[index], newItems[index + 1]] = [newItems[index + 1], newItems[index]];
    // Renumber order
    const renumbered = newItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));
    setItems(renumbered);
  }

  // Update item text
  function updateItemText(id: string, text: string) {
    setItems(items.map(item =>
      item.id === id ? { ...item, text } : item
    ));
  }

  // Toggle between bulk and individual mode
  function toggleBulkMode() {
    if (isBulkMode) {
      // Switching FROM bulk TO individual
      // Parse bulkText into items array
      const lines = bulkText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      const newItems: TemplateItem[] = lines.map((line, index) => {
        // Try to preserve existing item ID if text matches
        const existingItem = items.find(item => item.text === line);
        return {
          id: existingItem?.id || crypto.randomUUID(),
          text: line,
          order: index,
        };
      });

      setItems(newItems);
      setIsBulkMode(false);
    } else {
      // Switching FROM individual TO bulk
      // Convert items array to text
      const text = items.map(item => item.text).join('\n');
      setBulkText(text);
      setIsBulkMode(true);
    }
  }

  // Handle bulk text changes
  function handleBulkTextChange(text: string) {
    setBulkText(text);
  }

  // Handle form submission
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    // If in bulk mode, parse text to items first
    let finalItems = items;
    if (isBulkMode) {
      const lines = bulkText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);

      finalItems = lines.map((line, index) => {
        const existingItem = items.find(item => item.text === line);
        return {
          id: existingItem?.id || crypto.randomUUID(),
          text: line,
          order: index,
        };
      });
    }

    // Validation
    if (!name.trim()) {
      setError("Template name is required");
      return;
    }

    if (finalItems.length === 0) {
      setError("At least one item is required");
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        name: name.trim(),
        items: finalItems.map(item => ({
          text: item.text,
          order: item.order,
        })),
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save template");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Template Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Template Name
        </label>
        <input
          id="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          placeholder="e.g., Morning Routine"
          disabled={loading}
        />
      </div>

      {/* Items List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Checklist Items
          </label>
          <button
            type="button"
            onClick={toggleBulkMode}
            disabled={loading}
            className="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-4 py-2 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isBulkMode ? "Switch to Individual Mode" : "Switch to Bulk Text Mode"}
          </button>
        </div>

        {isBulkMode ? (
          // Bulk text mode
          <div className="space-y-2">
            <textarea
              value={bulkText}
              onChange={(e) => handleBulkTextChange(e.target.value)}
              rows={15}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono"
              placeholder="Enter one item per line. Empty lines will be ignored."
              disabled={loading}
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Each line becomes one checklist item
            </p>
          </div>
        ) : (
          // Individual mode
          <>
            {items.length > 0 && (
          <div className="space-y-2 mb-4">
            {items.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center gap-2 p-3 border border-gray-200 dark:border-gray-700 rounded-md bg-white dark:bg-gray-800"
              >
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={() => moveUp(index)}
                    disabled={index === 0 || loading}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move up"
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(index)}
                    disabled={index === items.length - 1 || loading}
                    className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                    title="Move down"
                  >
                    ▼
                  </button>
                </div>

                {/* Item text input */}
                <input
                  type="text"
                  value={item.text}
                  onChange={(e) => updateItemText(item.id, e.target.value)}
                  className="flex-1 px-3 py-1 border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  disabled={loading}
                />

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  disabled={loading}
                  className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 disabled:opacity-50"
                  title="Remove item"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

            {/* Add new item input */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newItemText}
                onChange={(e) => setNewItemText(e.target.value)}
                onKeyDown={handleNewItemKeyDown}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Type item and press Enter or click Add"
                disabled={loading}
              />
              <button
                type="button"
                onClick={addItem}
                disabled={loading || !newItemText.trim()}
                className="bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-6 py-2 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Add Item
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press Enter or click "Add Item" to add to the list
            </p>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "Saving..." : "Save Template"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
