"use client";

import { useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useConfirm } from "@/components/confirm-dialog";
import type { Collection } from "@/types/organization";

export type ListDetails = Pick<Collection, "name" | "description">;

/**
 * Create or rename a list. Which companies are in it is managed from the
 * list's table ("Add companies" / "Remove from list"), not here.
 */
export function ListDialog({
  open,
  onOpenChange,
  list,
  onSave,
  onDelete,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Present when editing an existing list. */
  list?: Collection;
  onSave: (details: ListDetails) => void;
  onDelete?: () => void;
}) {
  const confirm = useConfirm();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (!open) return;
    setName(list?.name ?? "");
    setDescription(list?.description ?? "");
  }, [open, list]);

  const editing = !!list;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit List" : "New List"}</DialogTitle>
          <DialogDescription>
            {editing ? "Rename the list or change its description." : "Create a list to group companies."}
          </DialogDescription>
        </DialogHeader>
        <form
          id="list-form"
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            if (!name.trim()) return;
            onSave({ name: name.trim(), description: description.trim() });
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="list-name">Name</Label>
            <Input
              id="list-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Nordic fintechs"
              autoFocus
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What ties these companies together?"
              rows={3}
            />
          </div>
        </form>
        <DialogFooter className="sm:justify-between">
          {editing && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              className="text-red-600 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-500/10"
              onClick={async () => {
                const ok = await confirm({
                  title: `Delete “${list.name}”?`,
                  description: "The companies in it are not deleted.",
                  confirmLabel: "Delete list",
                });
                if (ok) onDelete();
              }}
            >
              <Trash2 />
              Delete List
            </Button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" form="list-form" disabled={!name.trim()}>
              {editing ? "Save changes" : "Create List"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
