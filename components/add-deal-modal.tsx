"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Combobox, Field, FormDialog } from "@/components/form-dialog";
import { Avatar, CompanyLogo } from "@/components/record-table/cells";
import { getStageStyle } from "@/lib/stages";
import { getOrganizations } from "@/lib/organizationData";
import { STAGE_PROBABILITIES } from "@/lib/dealData";
import { OWNERS } from "@/lib/team";
import { DEAL_TAGS, tagStyle } from "@/lib/tags";
import { cn } from "@/lib/utils";
import type { Deal } from "@/types/deal";
import type { DealStage, Organization } from "@/types/organization";

interface AddDealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (deal: Omit<Deal, "id" | "createdAt">) => void;
  defaultStage?: DealStage;
}

const OPEN_STAGES: DealStage[] = ["New", "Lead", "Qualified", "Proposal", "Negotiation"];

export function AddDealModal({ isOpen, onClose, onAdd, defaultStage = "Lead" }: AddDealModalProps) {
  const [title, setTitle] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [value, setValue] = useState("");
  const [stage, setStage] = useState<DealStage>(defaultStage);
  const [expectedCloseDate, setExpectedCloseDate] = useState("");
  const [owner, setOwner] = useState("");
  const [probability, setProbability] = useState(String(STAGE_PROBABILITIES[defaultStage] ?? 20));
  const [nextStep, setNextStep] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);

  useEffect(() => {
    if (!isOpen) return;
    setOrganizations(getOrganizations());
    setStage(defaultStage);
    setProbability(String(STAGE_PROBABILITIES[defaultStage] ?? 20));
  }, [isOpen, defaultStage]);

  const reset = () => {
    setTitle("");
    setOrganizationId("");
    setValue("");
    setExpectedCloseDate("");
    setOwner("");
    setNextStep("");
    setTags([]);
  };

  const close = () => {
    reset();
    onClose();
  };

  const submit = () => {
    onAdd({
      title: title.trim(),
      organizationId,
      value: Number(value),
      currency: "USD",
      stage,
      expectedCloseDate,
      owner,
      probability: Number(probability),
      nextStep: nextStep.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
    });
    reset();
  };

  return (
    <FormDialog
      open={isOpen}
      onOpenChange={(open) => !open && close()}
      title="Create Deal"
      description="Add a new deal to your pipeline."
      submitLabel="Create Deal"
      submitDisabled={!title.trim() || !organizationId || !value || !expectedCloseDate}
      onSubmit={submit}
    >
      <Field label="Title" htmlFor="deal-title" required wide>
        <Input id="deal-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enterprise License" autoFocus />
      </Field>
      <Field label="Company" htmlFor="deal-company" required>
        <Combobox
          id="deal-company"
          value={organizationId}
          onChange={setOrganizationId}
          placeholder="Select company…"
          searchPlaceholder="Search companies…"
          emptyText="No company found."
          options={[...organizations]
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((org) => ({
              value: org.id,
              label: org.name,
              keywords: [org.industry],
              icon: <CompanyLogo name={org.name} logo={org.logo} />,
            }))}
        />
      </Field>
      <Field label="Value ($)" htmlFor="deal-value" required>
        <Input id="deal-value" type="number" min="0" value={value} onChange={(e) => setValue(e.target.value)} placeholder="50000" />
      </Field>
      <Field label="Stage" htmlFor="deal-stage">
        <Combobox
          id="deal-stage"
          value={stage}
          onChange={(next) => {
            setStage(next as DealStage);
            setProbability(String(STAGE_PROBABILITIES[next] ?? probability));
          }}
          options={OPEN_STAGES.map((s) => ({ value: s, label: s, icon: <span aria-hidden className={cn("h-2 w-2 shrink-0 rounded-full", getStageStyle(s).dot)} /> }))}
        />
      </Field>
      <Field label="Close Date" htmlFor="deal-close" required>
        <Input id="deal-close" type="date" value={expectedCloseDate} onChange={(e) => setExpectedCloseDate(e.target.value)} />
      </Field>
      <Field label="Owner" htmlFor="deal-owner">
        <Combobox
          id="deal-owner"
          value={owner}
          onChange={setOwner}
          placeholder="Select owner…"
          options={OWNERS.map((name) => ({ value: name, label: name, icon: <Avatar name={name} /> }))}
        />
      </Field>
      <Field label="Probability %" htmlFor="deal-probability" hint="Defaults to the stage's win rate.">
        <Input
          id="deal-probability"
          type="number"
          min="0"
          max="100"
          value={probability}
          onChange={(e) => setProbability(e.target.value)}
        />
      </Field>
      <Field label="Next Step" htmlFor="deal-next-step" wide>
        <Input id="deal-next-step" value={nextStep} onChange={(e) => setNextStep(e.target.value)} placeholder="Schedule demo with CTO" />
      </Field>
      <Field label="Tags" wide>
        <div role="group" aria-label="Tags" className="flex flex-wrap gap-1.5">
          {DEAL_TAGS.map((tag) => {
            const on = tags.includes(tag);
            return (
              <button
                key={tag}
                type="button"
                aria-pressed={on}
                onClick={() => setTags((prev) => (on ? prev.filter((t) => t !== tag) : [...prev, tag]))}
                className={cn(
                  "rounded-md border px-2 py-0.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50",
                  on ? cn(tagStyle(tag), "border-transparent") : "bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                {tag}
              </button>
            );
          })}
        </div>
      </Field>
    </FormDialog>
  );
}
