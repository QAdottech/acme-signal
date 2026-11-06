import Image from "next/image";

/** Header for public pages (e.g. a customer's proposal), which have no app nav. */
export function PublicHeader() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-14 max-w-[1400px] items-center px-6">
        <Image src="/logos/acme-full-logo.png" alt="ACME Signal" width={140} height={40} className="dark:invert" />
      </div>
    </header>
  );
}
