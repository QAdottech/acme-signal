"use client";

import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Combobox, Field, FormDialog } from "@/components/form-dialog";
import { getOrganizations } from "@/lib/organizationData";
import { getStageStyle } from "@/lib/stages";
import { OWNERS } from "@/lib/team";
import { Avatar, CompanyLogo } from "@/components/record-table/cells";
import { convertFileToDataUrl, generateUniqueFileName, saveFileToLocalStorage } from "@/lib/fileUtils";
import { cn } from "@/lib/utils";
import type { DealStage, Organization } from "@/types/organization";

interface AddOrganizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (organization: Omit<Organization, "id">) => void;
}

const BASE_INDUSTRIES = [
  "Artificial Intelligence",
  "Analytics",
  "Biotechnology",
  "Developer Tools",
  "E-commerce",
  "EdTech",
  "Fintech",
  "Gaming",
  "HR Technology",
  "Legal Technology",
  "Music",
  "Software testing",
  "Web Development",
];

const STAGES: DealStage[] = ["New", "Lead", "Qualified", "Proposal", "Negotiation", "Customer"];

export function AddOrganizationModal({ isOpen, onClose, onAdd }: AddOrganizationModalProps) {
  return <CompanyFormDialog isOpen={isOpen} onClose={onClose} onSubmit={onAdd} />;
}

/** Edit an existing company in the same form. Delete lives in the page's menu. */
export function EditOrganizationModal({
  isOpen,
  onClose,
  onEdit,
  organization,
}: {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (organization: Organization) => void;
  /** Kept for callers; deleting is done from the company page's menu. */
  onDelete?: (organizationId: string) => void;
  organization: Organization;
}) {
  return (
    <CompanyFormDialog
      isOpen={isOpen}
      onClose={onClose}
      initial={organization}
      onSubmit={(values) => onEdit({ ...organization, ...values, collections: organization.collections })}
    />
  );
}

function CompanyFormDialog({
  isOpen,
  onClose,
  onSubmit,
  initial,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (organization: Omit<Organization, "id">) => void;
  initial?: Organization;
}) {
  const editing = !!initial;
  const [name, setName] = useState("");
  const [industry, setIndustry] = useState("");
  const [location, setLocation] = useState("");
  const [employees, setEmployees] = useState("");
  const [owner, setOwner] = useState("");
  const [logo, setLogo] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [description, setDescription] = useState("");
  const [dealStage, setDealStage] = useState<DealStage>("New");
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen || !initial) return;
    setName(initial.name);
    setIndustry(initial.industry);
    setLocation(initial.location ?? "");
    setEmployees(initial.employees ? String(initial.employees) : "");
    setOwner(initial.owner ?? "");
    setLogo(initial.logo ?? "");
    setLogoPreview(initial.logo ?? "");
    setWebsiteUrl(initial.website_url ?? "");
    setDescription(initial.description ?? "");
    setDealStage(initial.dealStage);
  }, [isOpen, initial]);

  // Industries already used in the workspace, plus a few common ones.
  const industries = useMemo(
    () =>
      isOpen
        ? Array.from(new Set([...BASE_INDUSTRIES, ...getOrganizations().map((o) => o.industry)]))
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b))
        : [],
    [isOpen]
  );

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await convertFileToDataUrl(file);
      const logoPath = `/logos/${generateUniqueFileName(file.name)}`;
      // Stored in localStorage; a real app would upload it.
      saveFileToLocalStorage(logoPath, dataUrl);
      setLogo(logoPath);
      setLogoPreview(dataUrl);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  const reset = () => {
    setName("");
    setIndustry("");
    setLocation("");
    setEmployees("");
    setOwner("");
    setLogo("");
    setLogoPreview("");
    setWebsiteUrl("");
    setDescription("");
    setDealStage("New");
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    onSubmit({
      name: name.trim(),
      industry,
      location: location.trim(),
      employees: Number.parseInt(employees, 10) || 0,
      logo,
      website_url: websiteUrl.trim(),
      description: description.trim(),
      dealStage,
      collections: [],
      ...(owner ? { owner } : {}),
    });
    if (!editing) reset();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title={editing ? "Edit Company" : "Create Company"}
      description={editing ? "Update this company's details." : "Add a company to your CRM."}
      submitLabel={editing ? "Save Changes" : "Create Company"}
      submitDisabled={!name.trim() || !industry}
      onSubmit={submit}
    >
      <Field label="Name" htmlFor="company-name" required wide>
        <Input id="company-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Inc." autoFocus={!editing} />
      </Field>
      <Field label="Industry" htmlFor="company-industry" required>
        <Combobox
          id="company-industry"
          value={industry}
          onChange={setIndustry}
          placeholder="Select industry…"
          searchPlaceholder="Search industries…"
          emptyText="No industry found."
          options={industries.map((i) => ({ value: i, label: i }))}
        />
      </Field>
      <Field label="Location" htmlFor="company-location">
        <Input id="company-location" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Stockholm, Sweden" />
      </Field>
      <Field label="Employees" htmlFor="company-employees">
        <Input id="company-employees" type="number" min="0" value={employees} onChange={(e) => setEmployees(e.target.value)} placeholder="50" />
      </Field>
      <Field label="Deal Stage" htmlFor="company-stage">
        <Combobox
          id="company-stage"
          value={dealStage}
          onChange={(s) => setDealStage(s as DealStage)}
          options={(STAGES.includes(dealStage) ? STAGES : [...STAGES, dealStage]).map((s) => ({
            value: s,
            label: s,
            icon: <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", getStageStyle(s).dot)} />,
          }))}
        />
      </Field>
      <Field label="Owner" htmlFor="company-owner">
        <Combobox
          id="company-owner"
          value={owner}
          onChange={setOwner}
          placeholder="Select owner…"
          options={OWNERS.map((o) => ({ value: o, label: o, icon: <Avatar name={o} /> }))}
        />
      </Field>
      <Field label="Website URL" htmlFor="company-website">
        <Input id="company-website" type="url" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://example.com" />
      </Field>
      <Field label="Logo" htmlFor="company-logo" wide>
        <div className="flex items-center gap-3">
          {logoPreview.startsWith("data:") ? (
            // A fresh upload is a data URL, which next/image doesn't optimize.
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoPreview} alt="Logo preview" className="h-8 w-8 rounded-md border object-contain" />
          ) : (
            logo && <CompanyLogo name={name} logo={logo} />
          )}
          <input id="company-logo" ref={fileInput} type="file" accept="image/*" onChange={handleLogoUpload} className="sr-only" />
          <Button type="button" variant="outline" size="sm" onClick={() => fileInput.current?.click()}>
            <Upload />
            {logoPreview ? "Replace" : "Upload logo"}
          </Button>
          {logoPreview ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setLogo("");
                setLogoPreview("");
              }}
            >
              <X />
              Remove
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">PNG or JPG, up to 5 MB</span>
          )}
        </div>
      </Field>
      <Field label="Description" htmlFor="company-description" wide>
        <Textarea
          id="company-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="What does this company do?"
        />
      </Field>
    </FormDialog>
  );
}
