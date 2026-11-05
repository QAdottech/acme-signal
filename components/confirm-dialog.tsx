"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ConfirmOptions {
  title: string;
  description?: string;
  /** Label for the confirming button, e.g. "Delete". */
  confirmLabel?: string;
  /** Styles the confirm button red. Defaults to true. */
  destructive?: boolean;
}

type Confirm = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<Confirm | null>(null);

/**
 * App-wide confirmation dialog, replacing the browser's `confirm()`.
 * `const confirm = useConfirm(); if (await confirm({ title })) …`
 */
export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<Confirm>((next) => {
    resolver.current?.(false);
    setOptions(next);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const settle = (value: boolean) => {
    resolver.current?.(value);
    resolver.current = null;
    setOptions(null);
  };

  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog.Root open={!!options} onOpenChange={(open) => !open && settle(false)}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
          <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-lg border bg-background p-5 shadow-xl duration-150 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
            <AlertDialog.Title className="text-base font-semibold">{options?.title}</AlertDialog.Title>
            <AlertDialog.Description className="mt-1.5 text-[13px] text-muted-foreground">
              {options?.description ?? "This can't be undone."}
            </AlertDialog.Description>
            <div className="mt-5 flex justify-end gap-2">
              <AlertDialog.Cancel className={buttonVariants({ variant: "outline" })} onClick={() => settle(false)}>
                Cancel
              </AlertDialog.Cancel>
              <AlertDialog.Action
                className={cn(
                  buttonVariants({ variant: destructive ? "destructive" : "default" }),
                  destructive && "shadow-sm"
                )}
                onClick={() => settle(true)}
              >
                {options?.confirmLabel ?? "Delete"}
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const confirm = useContext(ConfirmContext);
  if (!confirm) throw new Error("useConfirm must be used inside ConfirmProvider");
  return confirm;
}
