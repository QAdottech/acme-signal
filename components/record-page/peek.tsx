"use client";

import Link from "next/link";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { ArrowUpRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Side preview of a record, opened by clicking a table row. Shows the
 * record's editable fields without leaving the list; "Open" goes to the
 * full page.
 */
export function RecordPeek({
  open,
  onOpenChange,
  title,
  href,
  avatar,
  subtitle,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  href: string;
  avatar: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-40 bg-black/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 right-0 z-50 flex w-[440px] max-w-full flex-col border-l bg-background shadow-2xl outline-none duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right"
        >
          <div className="flex h-12 shrink-0 items-center justify-end gap-1 border-b px-3">
            <Button asChild variant="outline" size="sm">
              <Link href={href} onClick={() => onOpenChange(false)}>
                Open
                <ArrowUpRight />
              </Link>
            </Button>
            <DialogPrimitive.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close preview" className="h-7 w-7">
                <X />
              </Button>
            </DialogPrimitive.Close>
          </div>
          <div className="flex items-center gap-3 px-5 pb-4 pt-5">
            {avatar}
            <div className="min-w-0">
              <DialogPrimitive.Title className="truncate text-lg font-semibold tracking-tight">
                {title}
              </DialogPrimitive.Title>
              {subtitle && (
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[13px] text-muted-foreground">
                  {subtitle}
                </div>
              )}
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto border-t">{children}</div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
