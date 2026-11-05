"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import {
  Activity,
  AtSign,
  Briefcase,
  Building2,
  CalendarDays,
  Download,
  Linkedin,
  Phone,
  Plus,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddPersonModal } from "@/components/add-person-modal";
import {
  RecordTable,
  useRecordTableState,
  type Column,
} from "@/components/record-table/record-table";
import {
  Avatar,
  CompanyChip,
  Empty,
  InlineSelect,
  StatusDot,
} from "@/components/record-table/cells";
import {
  FilterMenu,
  SearchField,
  countFilters,
  facetOptions,
  type FilterFacet,
  type FilterValues,
} from "@/components/record-table/toolbar";
import { RecordListLayout } from "@/components/record-table/layout";
import { PersonPeek } from "@/components/records/peeks";
import { SelectionBar } from "@/components/record-table/selection-bar";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { getPeople, savePeople } from "@/lib/personData";
import { getOrganizations } from "@/lib/organizationData";
import { exportPeopleToCSV } from "@/lib/exportUtils";
import { formatDate } from "@/lib/format";
import { useCreateIntent } from "@/lib/create-intent";
import type { Person } from "@/types/person";
import type { Organization } from "@/types/organization";
import { applySearchBug } from "@/lib/demo-bugs";
import { useConfirm } from "@/components/confirm-dialog";

const STATUSES = ["Active", "Inactive"] as const;
type StatusFilter = "all" | Person["status"];

export function PeopleClient() {
  const [people, setPeople] = useState<Person[]>([]);
  const confirm = useConfirm();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [filters, setFilters] = useState<FilterValues>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [peekId, setPeekId] = useState<string | null>(null);
  useCreateIntent("person", () => setIsModalOpen(true));
  const { sort, setSort, selectedIds, setSelectedIds } = useRecordTableState({
    columnId: "name",
    direction: "asc",
  });

  useEffect(() => {
    setPeople(getPeople());
    setOrganizations(getOrganizations());
  }, []);

  /** People store their company as a name; match it to a company record. */
  const orgByName = useMemo(
    () => new Map(organizations.map((org) => [org.name.toLowerCase(), org])),
    [organizations]
  );

  const persist = (next: Person[]) => {
    setPeople(next);
    savePeople(next);
  };

  const facets: FilterFacet[] = useMemo(
    () => [
      { key: "organization", label: "Company", options: facetOptions(people.map((p) => p.organization)) },
      { key: "role", label: "Role", options: facetOptions(people.map((p) => p.role)) },
    ],
    [people]
  );

  const matching = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const matches = (key: string, value: string | undefined) =>
      !filters[key]?.length || (!!value && filters[key].includes(value));
    return people.filter((person) => {
      const matchesSearch =
        !term ||
        [person.name, person.email, person.organization, person.role].some((field) =>
          field.toLowerCase().includes(term)
        );
      return (
        matchesSearch &&
        (statusFilter === "all" || person.status === statusFilter) &&
        matches("organization", person.organization) &&
        matches("role", person.role)
      );
    });
  }, [people, filters, searchTerm, statusFilter]);
  const visiblePeople = useMemo(() => applySearchBug(matching, searchTerm), [matching, searchTerm]);

  const columns: Column<Person>[] = [
    {
      id: "name",
      header: "Name",
      icon: UserRound,
      width: 190,
      sortValue: (p) => p.name.toLowerCase(),
      cell: (p) => (
        <Link prefetch={false} href={`/people/${p.id}`} className="flex min-w-0 items-center gap-2 underline-offset-2 hover:underline">
          {p.avatar ? (
            <Image src={p.avatar} alt="" width={20} height={20} className="h-5 w-5 shrink-0 rounded-full" />
          ) : (
            <Avatar name={p.name} />
          )}
          <span className="truncate font-medium">{p.name}</span>
        </Link>
      ),
      footer: (rows) => `${rows.length} ${rows.length === 1 ? "person" : "people"}`,
    },
    {
      id: "role",
      header: "Role",
      icon: Briefcase,
      width: 160,
      sortValue: (p) => p.role.toLowerCase(),
      cell: (p) => <span className="block truncate">{p.role || <Empty />}</span>,
    },
    {
      id: "organization",
      header: "Company",
      icon: Building2,
      width: 160,
      sortValue: (p) => p.organization.toLowerCase(),
      cell: (p) => {
        if (!p.organization) return <Empty />;
        const org = orgByName.get(p.organization.toLowerCase());
        return (
          <CompanyChip
            name={p.organization}
            logo={org?.logo}
            href={org ? `/organizations/${org.id}` : undefined}
          />
        );
      },
    },
    {
      id: "email",
      header: "Email",
      icon: AtSign,
      width: 210,
      sortValue: (p) => p.email.toLowerCase(),
      cell: (p) => (
        <a
          href={`mailto:${p.email}`}
          className="block truncate underline-offset-2 hover:text-link hover:underline"
        >
          {p.email}
        </a>
      ),
    },
    {
      id: "phone",
      header: "Phone",
      icon: Phone,
      width: 140,
      cell: (p) =>
        p.phone ? (
          <a href={`tel:${p.phone}`} className="block truncate tabular-nums hover:text-link">
            {p.phone}
          </a>
        ) : (
          <Empty />
        ),
    },
    {
      id: "status",
      header: "Status",
      icon: Activity,
      width: 104,
      sortValue: (p) => p.status,
      cell: (p) => (
        <InlineSelect
          label="Status"
          value={p.status}
          options={STATUSES}
          onChange={(status) => {
            persist(people.map((person) => (person.id === p.id ? { ...person, status } : person)));
            toast.success(`${p.name} marked ${status.toLowerCase()}`);
          }}
          renderValue={(status) => <StatusDot active={status === "Active"} label={status ?? "—"} />}
          renderOption={(status) => <StatusDot active={status === "Active"} label={status} />}
        />
      ),
    },
    {
      id: "lastContact",
      header: "Last contact",
      icon: CalendarDays,
      width: 112,
      firstSortDirection: "desc",
      sortValue: (p) => p.lastContact ?? "",
      cell: (p) => (p.lastContact ? formatDate(p.lastContact) : <Empty />),
    },
    {
      id: "linkedin",
      header: "LinkedIn",
      icon: Linkedin,
      width: 72,
      cell: (p) =>
        p.linkedIn ? (
          <a
            href={p.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${p.name} on LinkedIn`}
            className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Linkedin className="h-3.5 w-3.5" />
          </a>
        ) : (
          <Empty />
        ),
    },
  ];

  const addPerson = (newPerson: Omit<Person, "id">) => {
    const id = Math.random().toString(36).slice(2, 11);
    persist([...people, { ...newPerson, id }]);
    setIsModalOpen(false);
    toast.success(`Added ${newPerson.name}`);
  };

  const handleBulkStatus = (status: Person["status"]) => {
    const count = selectedIds.size;
    persist(people.map((p) => (selectedIds.has(p.id) ? { ...p, status } : p)));
    setSelectedIds(new Set());
    toast.success(`Marked ${count} ${count === 1 ? "person" : "people"} ${status.toLowerCase()}`);
  };

  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    const ok = await confirm({
      title: `Delete ${count} ${count === 1 ? "contact" : "contacts"}?`,
      confirmLabel: `Delete ${count === 1 ? "contact" : "contacts"}`,
    });
    if (!ok) return;
    persist(people.filter((p) => !selectedIds.has(p.id)));
    setSelectedIds(new Set());
    toast.success(`Deleted ${count} ${count === 1 ? "contact" : "contacts"}`);
  };

  const isFiltered = searchTerm !== "" || statusFilter !== "all" || countFilters(filters) > 0;

  return (
    <RecordListLayout
      title="People"
      description={
        isFiltered ? `${visiblePeople.length} of ${people.length} contacts` : `${people.length} contacts`
      }
      actions={
        <>
          <Button variant="outline" onClick={() => exportPeopleToCSV(visiblePeople)}>
            <Download />
            Export CSV
          </Button>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus />
            Add Person
          </Button>
        </>
      }
      toolbar={
        <>
          <SearchField value={searchTerm} onChange={setSearchTerm} placeholder="Search people..." />
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
          <FilterMenu facets={facets} values={filters} onChange={setFilters} />
        </>
      }
    >
      <RecordTable
        rows={visiblePeople}
        columns={columns}
        getRowId={(p) => p.id}
        rowLabel={(p) => p.name}
        sort={sort}
        onSortChange={setSort}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onRowClick={(p) => setPeekId(p.id)}
        emptyState={
          isFiltered
            ? "No people found matching your criteria."
            : "No people added yet. Click 'Add Person' to get started."
        }
      />

      <SelectionBar
        count={selectedIds.size}
        nouns={["person", "people"]}
        setField={{
          label: "Set status",
          options: STATUSES,
          renderOption: (status) => <StatusDot active={status === "Active"} label={status} />,
          onSelect: handleBulkStatus,
        }}
        onExport={() => exportPeopleToCSV(people.filter((p) => selectedIds.has(p.id)))}
        onDelete={handleBulkDelete}
        onClear={() => setSelectedIds(new Set())}
      />

      <AddPersonModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onAdd={addPerson} />
      <PersonPeek
        personId={peekId}
        onClose={() => setPeekId(null)}
        onChanged={(updated) => setPeople((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))}
      />
    </RecordListLayout>
  );
}
