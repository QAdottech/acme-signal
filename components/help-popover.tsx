"use client";

import { useEffect, useState } from "react";
import { HelpCircle, Mail, BookOpen } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Kbd } from "@/components/command-menu";
import { cn } from "@/lib/utils";

const NAV_SHORTCUTS: [string, string][] = [
  ["H", "Pipeline"],
  ["I", "Notifications"],
  ["T", "Tasks"],
  ["C", "Companies"],
  ["P", "People"],
  ["D", "Deals"],
];

/** Sidebar "Help" entry: shortcuts and support links. */
export function HelpPopover() {
  const [open, setOpen] = useState(false);
  const [isMac, setIsMac] = useState(true);

  useEffect(() => {
    setIsMac(/Mac|iPhone|iPad/.test(navigator.platform));
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-8 w-full items-center gap-2 rounded-md px-2 text-[13px] font-medium transition-colors",
            open
              ? "bg-accent text-foreground"
              : "text-gray-600 hover:bg-accent/70 hover:text-foreground dark:text-gray-400"
          )}
        >
          <HelpCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
          Help & shortcuts
        </button>
      </PopoverTrigger>
      <PopoverContent side="right" align="end" sideOffset={8} className="w-72 p-0">
        <div className="px-4 pb-2 pt-3">
          <h3 className="text-[13px] font-semibold">Keyboard shortcuts</h3>
        </div>
        <div className="space-y-1.5 px-4 pb-3 text-[13px]">
          <ShortcutRow label="Search and commands">
            <Kbd>{isMac ? "⌘" : "Ctrl"}</Kbd>
            <Kbd>K</Kbd>
          </ShortcutRow>
          {NAV_SHORTCUTS.map(([key, label]) => (
            <ShortcutRow key={key} label={`Go to ${label}`}>
              <Kbd>G</Kbd>
              <Kbd>{key}</Kbd>
            </ShortcutRow>
          ))}
          <ShortcutRow label="Close dialogs">
            <Kbd>Esc</Kbd>
          </ShortcutRow>
        </div>
        <Separator />
        <div className="p-1.5">
          <a
            href="https://docs.example.com"
            target="_blank"
            rel="noreferrer"
            className="flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] hover:bg-accent"
          >
            <BookOpen className="h-4 w-4 text-muted-foreground" />
            Documentation
          </a>
          <a
            href="mailto:support@example.com"
            className="flex h-8 items-center gap-2 rounded-md px-2.5 text-[13px] hover:bg-accent"
          >
            <Mail className="h-4 w-4 text-muted-foreground" />
            Contact support
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function ShortcutRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="flex items-center gap-1">{children}</span>
    </div>
  );
}
