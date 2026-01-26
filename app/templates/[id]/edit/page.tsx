"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import TemplateForm from "@/app/components/TemplateForm";

interface TemplateItem {
  id: string;
  text: string;
  order: number;
}

interface Template {
  id: string;
  name: string;
  items: TemplateItem[];
}

export default function EditTemplatePage() {
  const router = useRouter();
  const params = useParams();
  const { status } = useSession();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const templateId = params.id as string;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    if (status === "authenticated") {
      fetchTemplate();
    }
  }, [status, router, templateId]);

  async function fetchTemplate() {
    try {
      const response = await fetch(`/api/templates/${templateId}`);

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        if (response.status === 404) {
          setError("Template not found");
          setLoading(false);
          return;
        }
        throw new Error("Failed to fetch template");
      }

      const data = await response.json();
      setTemplate(data);
    } catch (err) {
      setError("Failed to load template");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(data: { name: string; items: { text: string; order: number }[] }) {
    const response = await fetch(`/api/templates/${templateId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update template");
    }

    router.push("/templates");
  }

  function handleCancel() {
    router.push("/templates");
  }

  if (status === "loading" || loading) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">{error}</h1>
          <button
            onClick={() => router.push("/templates")}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
          >
            Back to Templates
          </button>
        </div>
      </main>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <main className="min-h-screen p-8 md:p-24">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">Edit Template</h1>
        <p className="text-gray-600 mb-8">
          Update your template name and items
        </p>

        <TemplateForm
          initialData={template}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </main>
  );
}
