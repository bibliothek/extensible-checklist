"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import TemplateForm from "@/app/components/TemplateForm";

export default function NewTemplatePage() {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  async function handleSubmit(data: { name: string; items: { text: string; order: number }[] }) {
    const response = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to create template");
    }

    router.push("/templates");
  }

  function handleCancel() {
    router.push("/templates");
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500 dark:text-gray-400">Loading...</div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Create New Template</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Build a reusable checklist template with multiple items
        </p>

        <TemplateForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </main>
  );
}
