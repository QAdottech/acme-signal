"use client";

import { Sidebar } from "@/components/sidebar";
import { CommandMenu } from "@/components/command-menu";

/**
 * Authenticated app frame: sidebar on the left, the page scrolling on the
 * right. There is no top bar; search and the account menu live in the
 * sidebar, and each page owns its own header.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      <CommandMenu />
    </div>
  );
}
