"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const pathname = usePathname();

  const isTemplatesActive = pathname?.startsWith("/templates");
  const isChecklistsActive = pathname?.startsWith("/checklists");

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Extensible Checklist
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex space-x-4">
            <Link
              href="/templates"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isTemplatesActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Templates
            </Link>
            <Link
              href="/checklists"
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                isChecklistsActive
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
              }`}
            >
              Checklists
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
