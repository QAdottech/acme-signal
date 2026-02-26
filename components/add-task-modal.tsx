"use client";

import type React from "react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Task, TaskPriority, TaskStatus } from "@/types/task";
import type { Deal } from "@/types/deal";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Omit<Task, "id" | "createdAt">) => void;
  deals: Deal[];
  organizations: Organization[];
  people: Person[];
}

const owners = [
  "Sarah Johnson",
  "Michael Chen",
  "Emma Wilson",
  "David Martinez",
];

const priorities: { value: TaskPriority; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export function AddTaskModal({
  isOpen,
  onClose,
  onAdd,
  deals,
  organizations,
  people,
}: AddTaskModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [assignee, setAssignee] = useState("");
  const [relatedDealId, setRelatedDealId] = useState("");
  const [relatedOrganizationId, setRelatedOrganizationId] = useState("");
  const [relatedPersonId, setRelatedPersonId] = useState("");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    setDueDate("");
    setAssignee("");
    setRelatedDealId("");
    setRelatedOrganizationId("");
    setRelatedPersonId("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const task: Omit<Task, "id" | "createdAt"> = {
      title,
      status: "todo" as TaskStatus,
      priority,
      ...(assignee && assignee !== "none" && { assignee }),
      ...(description && { description }),
      ...(dueDate && { dueDate }),
      ...(relatedDealId && relatedDealId !== "none" && { relatedDealId }),
      ...(relatedOrganizationId && relatedOrganizationId !== "none" && { relatedOrganizationId }),
      ...(relatedPersonId && relatedPersonId !== "none" && { relatedPersonId }),
    };
    onAdd(task);
    resetForm();
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Create Task</DialogTitle>
          <DialogDescription>
            Add a new task to track your work.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-title" className="text-right">
                Title
              </Label>
              <Input
                id="task-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Follow up with client..."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="task-description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="task-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0 min-h-[80px]"
                placeholder="Optional details..."
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Priority</Label>
              <Select
                value={priority}
                onValueChange={(val) => setPriority(val as TaskPriority)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="task-due-date" className="text-right">
                Due Date
              </Label>
              <Input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="col-span-3 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Assignee</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select assignee..." />
                </SelectTrigger>
                <SelectContent>
                  {owners.map((o) => (
                    <SelectItem key={o} value={o}>
                      {o}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Deal</Label>
              <Select
                value={relatedDealId}
                onValueChange={setRelatedDealId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {deals.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Company</Label>
              <Select
                value={relatedOrganizationId}
                onValueChange={setRelatedOrganizationId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {organizations.map((org) => (
                    <SelectItem key={org.id} value={org.id}>
                      {org.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Person</Label>
              <Select
                value={relatedPersonId}
                onValueChange={setRelatedPersonId}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="None" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {people.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600 text-white"
              disabled={!title.trim()}
            >
              Create Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
