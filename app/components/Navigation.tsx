"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import LogoutButton from "./LogoutButton";

export default function Navigation() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const isTemplatesActive = pathname?.startsWith("/templates");
  const isChecklistsActive = pathname?.startsWith("/checklists");

  // Don't show navigation on auth pages
  if (pathname === "/login" || pathname === "/signup" || pathname === "/") {
    return null;
  }

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <div className="flex-shrink-0">
            <Link
              href="/dashboard"
              className="text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              <span className="hidden sm:inline">Extensible Checklist</span>
              <span className="sm:hidden">EC</span>
            </Link>
          </div>

          {/* Navigation Links and Logout */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            <nav className="flex flex-wrap sm:flex-nowrap space-x-2 sm:space-x-4">
              <Link
                href="/templates"
                className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isTemplatesActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Templates
              </Link>
              <Link
                href="/checklists"
                className={`px-3 py-2 sm:px-4 rounded-md text-xs sm:text-sm font-medium transition-colors ${
                  isChecklistsActive
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                }`}
              >
                Checklists
              </Link>
            </nav>

            {session && <LogoutButton />}
          </div>
        </div>
      </div>
    </header>
  );
}
