"use client";

import { useState, Suspense } from "react";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";

function SidebarWithSearch({ onSearch }: { onSearch: () => void }) {
  return <Sidebar onSearch={onSearch} />;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF9]">
      <Suspense
        fallback={
          <aside className="w-[244px] h-screen border-r border-neutral-200 bg-[#F7F7F5]" />
        }
      >
        <SidebarWithSearch onSearch={() => setSearchOpen(true)} />
      </Suspense>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 min-h-0 overflow-y-auto">{children}</main>
      </div>
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
    </div>
  );
}
