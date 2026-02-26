import { Organization } from "@/types/organization";
import { Person } from "@/types/person";

export function exportToCSV(data: any[], filename: string) {
  if (data.length === 0) {
    alert("No data to export");
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle arrays and objects
          if (Array.isArray(value)) {
            return `"${value.join("; ")}"`;
          }
          if (typeof value === "object" && value !== null) {
            return `"${JSON.stringify(value)}"`;
          }
          // Escape quotes and wrap in quotes if contains comma
          const stringValue = String(value || "");
          if (stringValue.includes(",") || stringValue.includes('"')) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",")
    ),
  ].join("\n");

  downloadFile(csvContent, filename, "text/csv");
}

export function exportOrganizationsToCSV(organizations: Organization[]) {
  const data = organizations.map((org) => ({
    name: org.name,
    industry: org.industry,
    location: org.location,
    employees: org.employees,
    website: org.website_url,
    dealStage: org.dealStage,
    annualRevenue: org.annualRevenue || "",
    owner: org.owner || "",
    description: org.description,
  }));
  exportToCSV(
    data,
    `organizations-${new Date().toISOString().split("T")[0]}.csv`
  );
}

export function exportPeopleToCSV(people: Person[]) {
  const data = people.map((person) => ({
    name: person.name,
    email: person.email,
    role: person.role,
    organization: person.organization,
    phone: person.phone || "",
    linkedIn: person.linkedIn || "",
    status: person.status,
    lastContact: person.lastContact || "",
    notes: person.notes || "",
  }));
  exportToCSV(data, `people-${new Date().toISOString().split("T")[0]}.csv`);
}

export function exportToJSON(data: any[], filename: string) {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, "application/json");
}

function downloadFile(content: string, filename: string, mimeType: string) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
