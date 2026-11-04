"use client";

import { Activity, AtSign, Briefcase, Building2, CalendarDays, Linkedin, Phone } from "lucide-react";
import { AttributeRow, AttributeSection, InlineText } from "@/components/record-page/attributes";
import { CompanyChip, InlineSelect, StatusDot } from "@/components/record-table/cells";
import { formatDate } from "@/lib/format";
import type { Organization } from "@/types/organization";
import type { Person } from "@/types/person";

export type PersonChange = (changes: Partial<Person>, message: string) => void;

const STATUSES = ["Active", "Inactive"] as const;

/** Editable fields for a person, used on their page and in the side preview. */
export function PersonFields({
  person,
  organization,
  onChange,
}: {
  person: Person;
  organization?: Organization;
  onChange: PersonChange;
}) {
  return (
    <AttributeSection title="Record details">
      <AttributeRow icon={AtSign} label="Email">
        <InlineText label="Email" type="email" value={person.email} onSave={(email) => onChange({ email }, "Email updated")} />
      </AttributeRow>
      <AttributeRow icon={Phone} label="Phone">
        <InlineText label="Phone" value={person.phone ?? ""} onSave={(phone) => onChange({ phone }, "Phone updated")} />
      </AttributeRow>
      <AttributeRow icon={Briefcase} label="Role">
        <InlineText label="Role" value={person.role} onSave={(role) => onChange({ role }, "Role updated")} />
      </AttributeRow>
      <AttributeRow icon={Building2} label="Company">
        <span className="block py-1">
          {person.organization ? (
            <CompanyChip
              name={person.organization}
              logo={organization?.logo}
              href={organization ? `/organizations/${organization.id}` : undefined}
            />
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </span>
      </AttributeRow>
      <AttributeRow icon={Activity} label="Status">
        <InlineSelect
          label="Status"
          value={person.status}
          options={STATUSES}
          onChange={(status) => onChange({ status }, `${person.name} marked ${status.toLowerCase()}`)}
          renderValue={(status) => <StatusDot active={status === "Active"} label={status ?? "—"} />}
          renderOption={(status) => <StatusDot active={status === "Active"} label={status} />}
        />
      </AttributeRow>
      <AttributeRow icon={CalendarDays} label="Last contact">
        <InlineText
          label="Last contact"
          type="date"
          value={person.lastContact ?? ""}
          format={formatDate}
          onSave={(lastContact) => onChange({ lastContact }, "Last contact updated")}
        />
      </AttributeRow>
      <AttributeRow icon={Linkedin} label="LinkedIn">
        {person.linkedIn ? (
          <a
            href={person.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="block truncate py-1 text-link underline-offset-2 hover:underline"
          >
            {person.linkedIn.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
          </a>
        ) : (
          <InlineText label="LinkedIn" type="url" value="" onSave={(linkedIn) => onChange({ linkedIn }, "LinkedIn updated")} />
        )}
      </AttributeRow>
    </AttributeSection>
  );
}
