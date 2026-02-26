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
      <div className="bg-orange-500 text-white rounded-lg shadow-2xl px-6 py-4 flex items-center gap-4">
        <span className="font-medium">{selectedCount} selected</span>
        
        <div className="h-6 w-px bg-orange-300" />
        
        <Select onValueChange={onChangeStatus}>
          <SelectTrigger className="w-[180px] bg-white text-gray-900 border-0">
            <SelectValue placeholder="Change status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Screening">Screening</SelectItem>
            <SelectItem value="Hitlist">Hitlist</SelectItem>
            <SelectItem value="Preparing for NDC">Preparing for NDC</SelectItem>
            <SelectItem value="Portfolio company">Portfolio company</SelectItem>
            <SelectItem value="Passive follow">Passive follow</SelectItem>
            <SelectItem value="Lost">Lost</SelectItem>
            <SelectItem value="Not interesting">Not interesting</SelectItem>
          </SelectContent>
        </Select>

        <Button
          variant="ghost"
          size="sm"
          onClick={onExport}
          className="text-white hover:bg-orange-600"
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

        <div className="h-6 w-px bg-orange-300" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="text-white hover:bg-orange-600"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

