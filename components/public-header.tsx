import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="w-full border-b bg-white dark:bg-gray-950">
      <div className="container max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-[#2D1A45] flex items-center justify-center">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="font-semibold text-sm text-gray-900 dark:text-white">
            ACME Signal
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="text-sm bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-md transition-colors"
          >
            Sign up
          </Link>
        </div>
      </div>
    </header>
  );
}
