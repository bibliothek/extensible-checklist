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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchChecklists();
    }
  }, [status, router]);

  async function fetchChecklists() {
    try {
      const response = await fetch("/api/checklists");

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch checklists");
      }

      const data = await response.json();
      setChecklists(data);
    } catch (err) {
      setError("Failed to load checklists");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
      return;
    }

    setDeleting(id);
    try {
      const response = await fetch(`/api/checklists/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete checklist");
      }

      // Optimistically remove from list
      setChecklists(checklists.filter(c => c.id !== id));
    } catch (err) {
      setError("Failed to delete checklist");
      setDeleting(null);
    }
  }

  function calculateProgress(checklist: Checklist) {
    const totalCount = checklist.items.length;
    const completedCount = checklist.items.filter(item => item.completed).length;
    const percentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

    return { totalCount, completedCount, percentage };
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
              <p className="text-gray-600 dark:text-gray-400">Your active checklists and quick actions</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/checklists/new"
                className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Checklist
              </Link>
              <Link
                href="/templates/new"
                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                Create Template
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {checklists.length === 0 ? (
            <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                No active checklists yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first checklist from templates to get started.
              </p>
              <Link
                href="/checklists/new"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create from Templates
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">
                Recent Checklists
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {checklists.map((checklist) => {
                  const { totalCount, completedCount, percentage } = calculateProgress(checklist);

                  return (
                    <div
                      key={checklist.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md transition-all bg-white dark:bg-gray-800"
                    >
                      <Link href={`/checklists/${checklist.id}`}>
                        <h3 className="text-xl font-semibold mb-3 text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                          {checklist.name}
                        </h3>
                      </Link>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>{completedCount}/{totalCount} items completed</span>
                          <span>{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>

                      <p className="text-xs text-gray-500 dark:text-gray-500 mb-6">
                        Created {new Date(checklist.createdAt).toLocaleDateString()}
                      </p>

                      <div className="flex gap-3">
                        <Link
                          href={`/checklists/${checklist.id}`}
                          className="flex-1 text-center bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 px-4 py-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        >
                          Open
                        </Link>
                        <button
                          onClick={() => handleDelete(checklist.id, checklist.name)}
                          disabled={deleting === checklist.id}
                          className="flex-1 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-md hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {deleting === checklist.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
  );
}
