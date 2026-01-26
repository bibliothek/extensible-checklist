"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface TemplateItem {
  id: string;
  text: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  createdAt: string;
  items: TemplateItem[];
}

export default function NewChecklistPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);

  // Form state
  const [checklistName, setChecklistName] = useState("");
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchTemplates();
    }
  }, [status, router]);

  async function fetchTemplates() {
    try {
      const response = await fetch("/api/templates");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch templates");
      }

      const data = await response.json();
      setTemplates(data);
    } catch (err) {
      setError("Failed to load templates");
    } finally {
      setLoading(false);
    }
  }

  // Toggle template selection (maintains order)
  function toggleTemplate(templateId: string) {
    if (selectedTemplateIds.includes(templateId)) {
      // Deselect
      setSelectedTemplateIds(selectedTemplateIds.filter(id => id !== templateId));
    } else {
      // Select (append to end to maintain order)
      setSelectedTemplateIds([...selectedTemplateIds, templateId]);
    }
  }

  // Move selected template up in order
  function moveTemplateUp(templateId: string) {
    const index = selectedTemplateIds.indexOf(templateId);
    if (index <= 0) return;

    const newOrder = [...selectedTemplateIds];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    setSelectedTemplateIds(newOrder);
  }

  // Move selected template down in order
  function moveTemplateDown(templateId: string) {
    const index = selectedTemplateIds.indexOf(templateId);
    if (index === -1 || index >= selectedTemplateIds.length - 1) return;

    const newOrder = [...selectedTemplateIds];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    setSelectedTemplateIds(newOrder);
  }

  // Create checklist
  async function handleCreateChecklist() {
    if (!checklistName.trim()) {
      setError("Checklist name is required");
      return;
    }

    if (selectedTemplateIds.length === 0) {
      setError("Please select at least one template");
      return;
    }

    setCreating(true);
    setError("");

    try {
      const response = await fetch("/api/checklists/instantiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: checklistName.trim(),
          templateIds: selectedTemplateIds,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to create checklist");
      }

      const checklist = await response.json();

      // Redirect to homepage with success message for now
      // TODO: Once checklist view page exists, redirect to /checklists/[id]
      router.push("/?checklist=created");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create checklist");
      setCreating(false);
    }
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </main>
    );
  }

  // Empty state: no templates
  if (templates.length === 0) {
    return (
      <main className="min-h-screen p-8 md:p-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Create Checklist</h1>

          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No templates available
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create templates first, then you can use them to build checklists.
            </p>
            <Link
              href="/templates/new"
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Create Your First Template
            </Link>
          </div>

          <div className="mt-8">
            <Link
              href="/"
              className="text-blue-600 hover:underline"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Create Checklist</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Select templates to merge into a working checklist
        </p>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Checklist Name Input */}
        <div className="mb-8">
          <label htmlFor="checklistName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Checklist Name
          </label>
          <input
            id="checklistName"
            type="text"
            required
            value={checklistName}
            onChange={(e) => setChecklistName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="e.g., Monday Morning Workflow"
            disabled={creating}
          />
        </div>

        {/* Template Selection */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Templates to Merge</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Selection order matters! Items will appear in the order you select templates.
            {selectedTemplateIds.length > 0 && (
              <span className="font-medium text-blue-600 dark:text-blue-400 ml-1">
                ({selectedTemplateIds.length} selected)
              </span>
            )}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {templates.map((template) => {
              const isSelected = selectedTemplateIds.includes(template.id);
              const selectionOrder = selectedTemplateIds.indexOf(template.id) + 1;

              return (
                <div
                  key={template.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800"
                  }`}
                  onClick={() => toggleTemplate(template.id)}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleTemplate(template.id)}
                        className="w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {template.name}
                      </h3>
                    </div>
                    {isSelected && (
                      <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-blue-600 text-white text-sm font-bold">
                        {selectionOrder}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 ml-7">
                    {template.items.length} {template.items.length === 1 ? "item" : "items"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Templates in Order */}
        {selectedTemplateIds.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Selected Order</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Items will appear in this order. Use arrows to reorder.
            </p>
            <div className="space-y-2">
              {selectedTemplateIds.map((templateId, index) => {
                const template = templates.find(t => t.id === templateId);
                if (!template) return null;

                return (
                  <div
                    key={templateId}
                    className="flex items-center gap-3 p-3 border border-blue-200 dark:border-blue-800 rounded-md bg-blue-50 dark:bg-blue-900/20"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white font-bold">
                      {index + 1}
                    </span>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {template.items.length} {template.items.length === 1 ? "item" : "items"}
                      </p>
                    </div>

                    <div className="flex flex-col gap-1">
                      <button
                        type="button"
                        onClick={() => moveTemplateUp(templateId)}
                        disabled={index === 0 || creating}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move up"
                      >
                        ▲
                      </button>
                      <button
                        type="button"
                        onClick={() => moveTemplateDown(templateId)}
                        disabled={index === selectedTemplateIds.length - 1 || creating}
                        className="text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
                        title="Move down"
                      >
                        ▼
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleTemplate(templateId)}
                      disabled={creating}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 px-3 py-1 disabled:opacity-50"
                      title="Remove from selection"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t dark:border-gray-700">
          <button
            type="button"
            onClick={handleCreateChecklist}
            disabled={creating || !checklistName.trim() || selectedTemplateIds.length === 0}
            className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {creating ? "Creating Checklist..." : "Create Checklist"}
          </button>
          <Link
            href="/"
            className="flex-1 text-center bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </Link>
        </div>
      </div>
    </main>
  );
}
