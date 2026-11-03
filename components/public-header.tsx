import Image from "next/image";
import Link from "next/link";

export function PublicHeader() {
  return (
    <header className="w-full border-b bg-background">
      <div className="container max-w-[1400px] mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/login" className="flex items-center">
          <Image
            src="/logos/acme-full-logo.png"
            alt="ACME Signal"
            width={140}
            height={40}
            className="dark:invert"
          />
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="inline-flex h-8 items-center rounded-md border border-input bg-background px-3 text-[13px] font-medium shadow-sm transition-colors hover:bg-accent"
          >
            Log in
          </Link>
        </div>
      </div>
    </header>
  );
}
