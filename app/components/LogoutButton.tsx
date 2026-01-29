"use client";

import { signOut } from "next-auth/react";

export default function LogoutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/" })}
      className="bg-red-600 text-white px-4 py-2 sm:px-6 text-xs sm:text-sm rounded-md hover:bg-red-700 transition-colors"
    >
      Log Out
    </button>
  );
}
