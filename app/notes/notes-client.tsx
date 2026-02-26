"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Plus, StickyNote, Trash2, Building2 } from "lucide-react";
import { getNotes, deleteNote, type Note } from "@/lib/notesData";
import { getOrganizations } from "@/lib/organizationData";
import type { Organization } from "@/types/organization";
import { AddNoteModal } from "@/components/add-note-modal";

function timeAgo(dateString: string): string {
  const now = Date.now();
  const date = new Date(dateString).getTime();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months === 1 ? "" : "s"} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export function NotesClient() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [orgFilter, setOrgFilter] = useState<string>("all");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setNotes(getNotes());
    setOrganizations(getOrganizations());
  }, []);

  const orgMap = useMemo(() => {
    const map = new Map<string, Organization>();
    organizations.forEach((org) => map.set(org.id, org));
    return map;
  }, [organizations]);

  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Sort by newest first
    result.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Filter by organization
    if (orgFilter !== "all") {
      result = result.filter((note) => note.organizationId === orgFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((note) => {
        const org = orgMap.get(note.organizationId);
        const orgName = org?.name?.toLowerCase() || "";
        return (
          note.content.toLowerCase().includes(term) ||
          orgName.includes(term) ||
          note.authorName.toLowerCase().includes(term)
        );
      });
    }

    return result;
  }, [notes, orgFilter, searchTerm, orgMap]);

  // Get unique org IDs that have notes for the filter dropdown
  const orgsWithNotes = useMemo(() => {
    const orgIds = new Set(notes.map((n) => n.organizationId));
    return organizations
      .filter((org) => orgIds.has(org.id))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [notes, organizations]);

  const handleDeleteNote = (noteId: string) => {
    deleteNote(noteId);
    setNotes(getNotes());
  };

  const handleNoteAdded = () => {
    setNotes(getNotes());
    setIsModalOpen(false);
  };

  return (
    <main className="container py-8 max-w-[1000px] mx-auto px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notes
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {notes.length} total note{notes.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button
          onClick={() => setIsModalOpen(true)}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Add Note
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search notes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent"
          />
        </div>
        <Select value={orgFilter} onValueChange={setOrgFilter}>
          <SelectTrigger className="w-[200px] bg-white dark:bg-gray-800">
            <SelectValue placeholder="All organizations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All organizations</SelectItem>
            {orgsWithNotes.map((org) => (
              <SelectItem key={org.id} value={org.id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Notes Feed */}
      {filteredNotes.length === 0 ? (
        <div className="text-center py-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
            <StickyNote className="w-8 h-8 text-gray-400 dark:text-gray-500" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No notes found
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {searchTerm || orgFilter !== "all"
              ? "Try adjusting your search or filter."
              : "Get started by adding your first note."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNotes.map((note) => {
            const org = orgMap.get(note.organizationId);
            return (
              <div
                key={note.id}
                className="group rounded-lg border bg-white dark:bg-gray-900 dark:border-gray-800 p-5 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    {org?.logo ? (
                      <Image
                        src={org.logo}
                        alt={org.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        <Building2 className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                      </div>
                    )}
                    <div className="min-w-0">
                      {org ? (
                        <Link
                          href={`/organizations/${org.id}`}
                          className="text-sm font-medium text-gray-900 dark:text-white hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
                        >
                          {org.name}
                        </Link>
                      ) : (
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Unknown organization
                        </span>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {note.authorName} &middot;{" "}
                        {timeAgo(note.createdAt)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all flex-shrink-0"
                    aria-label="Delete note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <p className="mt-3 text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {note.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onNoteAdded={handleNoteAdded}
        organizations={organizations}
      />
    </main>
  );
}
