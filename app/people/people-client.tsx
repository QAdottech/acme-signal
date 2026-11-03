"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Search,
  Plus,
  Mail,
  Phone,
  Linkedin,
  X,
  Download,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { AddPersonModal } from "@/components/add-person-modal";
import { EditPersonModal } from "@/components/edit-person-modal";
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import type { Person } from "@/types/person";
import { getPeople, savePeople } from "@/lib/personData";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { exportPeopleToCSV } from "@/lib/exportUtils";
import { formatDate } from "@/lib/format";
import { PageHeader } from "@/components/page-header";
import { SegmentedControl } from "@/components/ui/segmented-control";

type SortField = "name" | "role" | "organization" | "status" | "lastContact";
type SortDirection = "asc" | "desc";

export function PeopleClient() {
  const [people, setPeople] = useState<Person[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  useEffect(() => {
    setPeople(getPeople());
  }, []);

  const addPerson = (newPerson: Omit<Person, "id">) => {
    const id = Math.random().toString(36).substr(2, 9);
    const updatedPeople = [...people, { ...newPerson, id }];
    setPeople(updatedPeople);
    savePeople(updatedPeople);
    setIsModalOpen(false);
  };

  const updatePerson = (updatedPerson: Person) => {
    const updatedPeople = people.map((p) =>
      p.id === updatedPerson.id ? updatedPerson : p
    );
    setPeople(updatedPeople);
    savePeople(updatedPeople);
    setEditingPerson(null);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortPeople = (items: Person[]) => {
    return [...items].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "role":
          aValue = a.role.toLowerCase();
          bValue = b.role.toLowerCase();
          break;
        case "organization":
          aValue = a.organization.toLowerCase();
          bValue = b.organization.toLowerCase();
          break;
        case "status":
          aValue = a.status.toLowerCase();
          bValue = b.status.toLowerCase();
          break;
        case "lastContact":
          aValue = a.lastContact || "";
          bValue = b.lastContact || "";
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
      if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  };

  const filteredPeople = sortPeople(
    people.filter((person) => {
      const matchesSearch =
        person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.organization.toLowerCase().includes(searchTerm.toLowerCase()) ||
        person.role.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || person.status === statusFilter;

      return matchesSearch && matchesStatus;
    })
  );

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredPeople.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredPeople.map((person) => person.id)));
    }
  };

  const handleBulkStatusChange = (status: string) => {
    const updatedPeople = people.map((person) =>
      selectedIds.has(person.id)
        ? { ...person, status: status as Person["status"] }
        : person
    );
    setPeople(updatedPeople);
    savePeople(updatedPeople);
    setSelectedIds(new Set());
  };

  const handleBulkExport = () => {
    const selectedPeople = people.filter((person) =>
      selectedIds.has(person.id)
    );
    exportPeopleToCSV(selectedPeople);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to delete ${selectedIds.size} contacts?`
      )
    ) {
      const updatedPeople = people.filter(
        (person) => !selectedIds.has(person.id)
      );
      setPeople(updatedPeople);
      savePeople(updatedPeople);
      setSelectedIds(new Set());
    }
  };

  const handleExportAll = () => {
    exportPeopleToCSV(filteredPeople);
  };

  const isFiltered = searchTerm !== "" || statusFilter !== "all";

  return (
      <main className="mx-auto w-full max-w-[1400px] px-8 py-6">
        <PageHeader
          title="People"
          description={
            isFiltered
              ? `${filteredPeople.length} of ${people.length} contacts`
              : `${people.length} contacts`
          }
          actions={
            <>
              <Button onClick={handleExportAll} variant="outline">
                <Download />
                Export CSV
              </Button>
              <Button onClick={() => setIsModalOpen(true)}>
                <Plus />
                Add Person
              </Button>
            </>
          }
        />

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative w-full max-w-xs">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <SegmentedControl
            aria-label="Filter by status"
            value={statusFilter}
            onChange={setStatusFilter}
            options={[
              { value: "all", label: "All" },
              { value: "Active", label: "Active" },
              { value: "Inactive", label: "Inactive" },
            ]}
          />

          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="text-muted-foreground"
            >
              <X className="w-4 h-4" />
              Clear search
            </Button>
          )}
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={
                    selectedIds.size === filteredPeople.length &&
                    filteredPeople.length > 0
                  }
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-2">
                  Name
                  {sortField === "name" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
                onClick={() => handleSort("role")}
              >
                <div className="flex items-center gap-2">
                  Role
                  {sortField === "role" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
                onClick={() => handleSort("organization")}
              >
                <div className="flex items-center gap-2">
                  Organization
                  {sortField === "organization" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead className="whitespace-nowrap">Email</TableHead>
              <TableHead className="whitespace-nowrap">Phone</TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
                onClick={() => handleSort("status")}
              >
                <div className="flex items-center gap-2">
                  Status
                  {sortField === "status" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className="cursor-pointer whitespace-nowrap hover:text-foreground select-none"
                onClick={() => handleSort("lastContact")}
              >
                <div className="flex items-center gap-2">
                  Last Contact
                  {sortField === "lastContact" &&
                    (sortDirection === "asc" ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    ))}
                </div>
              </TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPeople.map((person) => (
              <TableRow
                key={person.id}
                className="cursor-pointer"
                onClick={() => setEditingPerson(person)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(person.id)}
                    onCheckedChange={() => toggleSelection(person.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 relative shrink-0 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {person.avatar ? (
                        <Image
                          src={person.avatar}
                          alt={person.name}
                          width={24}
                          height={24}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-[10px] font-semibold text-gray-600 dark:text-gray-300">
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium whitespace-nowrap">{person.name}</span>
                  </div>
                </TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>{person.organization}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-1.5 whitespace-nowrap text-foreground hover:text-link"
                  >
                    <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                    {person.email}
                  </a>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center gap-1.5 whitespace-nowrap text-muted-foreground hover:text-foreground"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {person.phone}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <span
                    className={
                      person.status === "Active"
                        ? "inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
                        : "inline-flex items-center gap-1.5 rounded-md bg-muted px-1.5 py-0.5 text-xs font-medium text-muted-foreground"
                    }
                  >
                    <span
                      aria-hidden
                      className={`h-1.5 w-1.5 rounded-full ${person.status === "Active" ? "bg-emerald-500" : "bg-gray-400"}`}
                    />
                    {person.status}
                  </span>
                </TableCell>
                <TableCell>
                  {person.lastContact
                    ? formatDate(person.lastContact)
                    : "\u2014"}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  {person.linkedIn && (
                    <a
                      href={person.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-7 h-7 rounded-md hover:bg-muted transition-colors"
                      title="View LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4 text-muted-foreground" />
                    </a>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredPeople.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || statusFilter !== "all"
                ? "No people found matching your criteria."
                : "No people added yet. Click 'Add Person' to get started."}
            </p>
          </div>
        )}

        <AddPersonModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAdd={addPerson}
        />

        <EditPersonModal
          isOpen={editingPerson !== null}
          person={editingPerson}
          onClose={() => setEditingPerson(null)}
          onSave={updatePerson}
        />

        <BulkActionsBar
          selectedCount={selectedIds.size}
          onClearSelection={() => setSelectedIds(new Set())}
          onChangeStatus={handleBulkStatusChange}
          onExport={handleBulkExport}
          onDelete={handleBulkDelete}
        />
      </main>
  );
}
