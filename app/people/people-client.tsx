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
import { BulkActionsBar } from "@/components/bulk-actions-bar";
import type { Person } from "@/types/person";
import { getPeople, savePeople } from "@/lib/personData";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { exportPeopleToCSV } from "@/lib/exportUtils";

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
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-semibold">People</h1>
            <span className="text-sm text-muted-foreground">
              {isFiltered
                ? `${filteredPeople.length} of ${people.length} contacts`
                : `${people.length} contacts`}
            </span>
          </div>
          <div className="flex gap-3">
            <Button
              onClick={handleExportAll}
              variant="outline"
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4" />
              Add Person
            </Button>
          </div>
        </div>

        <div className="mb-6 flex items-center gap-4">
          <div className="relative flex-grow max-w-md">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("all")}
              className={
                statusFilter === "all"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              All
            </Button>
            <Button
              variant={statusFilter === "Active" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Active")}
              className={
                statusFilter === "Active"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "Inactive" ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter("Inactive")}
              className={
                statusFilter === "Inactive"
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              Inactive
            </Button>
          </div>

          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
              className="gap-2 text-gray-500 hover:text-gray-700"
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
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
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
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
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
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
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
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
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
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 select-none"
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
                className="hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.has(person.id)}
                    onCheckedChange={() => toggleSelection(person.id)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 relative rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      {person.avatar ? (
                        <Image
                          src={person.avatar}
                          alt={person.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
                          {person.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                            .slice(0, 2)}
                        </span>
                      )}
                    </div>
                    <span className="font-medium">{person.name}</span>
                  </div>
                </TableCell>
                <TableCell>{person.role}</TableCell>
                <TableCell>{person.organization}</TableCell>
                <TableCell>
                  <a
                    href={`mailto:${person.email}`}
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    <Mail className="w-4 h-4" />
                    {person.email}
                  </a>
                </TableCell>
                <TableCell>
                  {person.phone && (
                    <a
                      href={`tel:${person.phone}`}
                      className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      <Phone className="w-4 h-4" />
                      {person.phone}
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      person.status === "Active" ? "default" : "secondary"
                    }
                    className={
                      person.status === "Active"
                        ? "bg-green-500 hover:bg-green-600"
                        : ""
                    }
                  >
                    {person.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  {person.lastContact
                    ? new Date(person.lastContact).toLocaleDateString()
                    : "\u2014"}
                </TableCell>
                <TableCell>
                  {person.linkedIn && (
                    <a
                      href={person.linkedIn}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      title="View LinkedIn Profile"
                    >
                      <Linkedin className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
