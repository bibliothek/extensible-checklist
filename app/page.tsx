import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <h1 className="text-4xl font-bold">Extensible Checklist</h1>
      <p className="mt-4 text-lg text-gray-600">
        Fast, frictionless checklist instantiation
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/signup"
          className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700"
        >
          Get Started
        </Link>
        <Link
          href="/login"
          className="bg-gray-200 text-gray-800 px-6 py-3 rounded-md hover:bg-gray-300"
        >
          Log In
        </Link>
      </div>
    </main>
  );
}
