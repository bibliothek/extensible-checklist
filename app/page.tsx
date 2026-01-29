"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LogoutButton from "./components/LogoutButton";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
      return;
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24">
        <div className="text-gray-500">Loading...</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-12 md:p-24">
      <h1 className="text-3xl sm:text-4xl font-bold">Extensible Checklist</h1>
      <p className="mt-3 text-base sm:text-lg text-gray-600">
        Fast, frictionless checklist instantiation
      </p>

      <div className="mt-8 flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto px-4 sm:px-0">
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-blue-700 text-center w-full sm:w-auto"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="bg-gray-200 text-gray-800 px-4 py-2 sm:px-6 sm:py-3 rounded-md hover:bg-gray-300 text-center w-full sm:w-auto"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
