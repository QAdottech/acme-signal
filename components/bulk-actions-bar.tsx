"use client";

import { Button } from "@/components/ui/button";
import { X, Trash2, Tag, Download } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface BulkActionsBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onChangeStatus: (status: string) => void;
  onExport: () => void;
  onDelete: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onClearSelection,
  onChangeStatus,
  onExport,
  onDelete,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
      <div className="bg-foreground text-background rounded-lg shadow-xl px-4 py-2.5 flex items-center gap-4">
        <span className="font-medium">{selectedCount} selected</span>
        
        <div className="h-6 w-px bg-background/20" />
        
        <Select onValueChange={onChangeStatus}>
          <SelectTrigger className="w-[180px] bg-white text-gray-900 border-0">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="New">New</SelectItem>
            <SelectItem value="Lead">Lead</SelectItem>
            <SelectItem value="Qualified">Qualified</SelectItem>
            <SelectItem value="Proposal">Proposal</SelectItem>
            <SelectItem value="Negotiation">Negotiation</SelectItem>
            <SelectItem value="Customer">Customer</SelectItem>
            <SelectItem value="Churned">Churned</SelectItem>
            <SelectItem value="Closed Lost">Closed Lost</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="text-background hover:bg-background/10 hover:text-background"
        >
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-white hover:bg-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </Button>

        <div className="h-6 w-px bg-background/20" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-background hover:bg-background/10 hover:text-background"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

