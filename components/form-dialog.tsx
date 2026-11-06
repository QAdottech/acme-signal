"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

/**
 * The one layout every create dialog uses: title and one line of context,
 * stacked fields in a scrolling body, and Cancel plus a primary action in a
 * footer that names what it does ("Create Deal", "Send Email").
 */
export function FormDialog({
  open,
  onOpenChange,
  title,
  description,
  submitLabel,
  submitIcon,
  submitDisabled,
  onSubmit,
  size = "md",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  submitLabel: string;
  submitIcon?: React.ReactNode;
  submitDisabled?: boolean;
  onSubmit: () => void;
  size?: "sm" | "md";
  children: React.ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("gap-0 p-0", size === "sm" ? "sm:max-w-[440px]" : "sm:max-w-[560px]")}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!submitDisabled) onSubmit();
          }}
          className="flex max-h-[85vh] flex-col"
        >
          <DialogHeader className="px-6 pb-4 pt-5 text-left">
            <DialogTitle className="text-base">{title}</DialogTitle>
            {description && <DialogDescription className="text-[13px]">{description}</DialogDescription>}
          </DialogHeader>
          <div className="min-h-0 flex-1 overflow-y-auto px-6 pb-5">
            <div className="grid grid-cols-2 gap-x-3 gap-y-4">{children}</div>
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/30 px-6 py-3 sm:gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitDisabled}>
              {submitIcon}
              {submitLabel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/** A labelled field. Half width by default; `wide` spans the dialog. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  wide,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col gap-1.5", wide ? "col-span-2" : "col-span-2 sm:col-span-1")}>
      {/* The asterisk sits outside the <label> so the field's name stays exactly "Name". */}
      <span className="flex items-baseline gap-0.5">
        <Label htmlFor={htmlFor} className="text-[13px] font-medium">
          {label}
        </Label>
        {required && (
          <span aria-hidden className="text-[13px] text-muted-foreground">
            *
          </span>
        )}
      </span>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export interface ComboboxOption {
  value: string;
  label: string;
  /** Extra words to match when searching, e.g. a company's industry. */
  keywords?: string[];
  icon?: React.ReactNode;
}

/**
 * Single-select picker: a button that opens a searchable list. Its id pairs
 * with a Field's htmlFor, so it is announced (and found) by its label.
 */
export function Combobox({
  id,
  value,
  options,
  onChange,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results.",
  allowClear,
}: {
  id?: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  /** Adds a "None" option that clears the value. */
  allowClear?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const searchable = options.length > 6;
  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between px-3 font-normal"
        >
          <span className={cn("flex min-w-0 items-center gap-2 truncate", !selected && "text-muted-foreground")}>
            {selected?.icon}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDown className="h-3.5 w-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[--radix-popover-trigger-width] min-w-[220px] p-0">
        <Command>
          {searchable && <CommandInput placeholder={searchPlaceholder} />}
          <CommandList className="max-h-64">
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {allowClear && (
                <CommandItem value="__none" onSelect={() => select("")} className="text-muted-foreground">
                  <Check className={cn("h-4 w-4", value ? "opacity-0" : "opacity-100")} />
                  None
                </CommandItem>
              )}
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  keywords={[option.label, ...(option.keywords ?? [])]}
                  onSelect={() => select(option.value)}
                >
                  <Check className={cn("h-4 w-4", value === option.value ? "opacity-100" : "opacity-0")} />
                  {option.icon}
                  <span className="truncate">{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
