"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Sidebar } from "@/components/sidebar";
import { CommandMenu } from "@/components/command-menu";

/**
 * Authenticated app frame: sidebar on the left, the page scrolling on the
 * right. There is no top bar; search and the account menu live in the
 * sidebar, and each page owns its own header.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  // Confirm a demo-data reset after the full reload that follows it.
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get("reset") !== "1") return;
    toast.success("Demo data reset");
    url.searchParams.delete("reset");
    window.history.replaceState(window.history.state, "", url.pathname + url.search + url.hash);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="min-w-0 flex-1 overflow-y-auto">{children}</div>
      <CommandMenu />
    </div>
  );
}
