"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  Plus,
  Mail,
  ChevronDown,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { getEmails } from "@/lib/emailData";
import { ComposeEmailModal } from "@/components/compose-email-modal";
import type { EmailRecord, EmailType, EmailStatus } from "@/types/email";

function timeAgo(dateString: string): string {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return date.toLocaleDateString();
}

function getTypeBadgeClasses(type: EmailType): string {
  switch (type) {
    case "verification":
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
    case "welcome":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "outreach":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300";
    case "follow_up":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300";
  }
}

function getStatusBadgeClasses(status: EmailStatus): string {
  switch (status) {
    case "sent":
      return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300";
    case "delivered":
      return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300";
    case "failed":
      return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300";
  }
}

function formatType(type: EmailType): string {
  switch (type) {
    case "follow_up":
      return "Follow Up";
    case "verification":
      return "Verification";
    case "welcome":
      return "Welcome";
    case "outreach":
      return "Outreach";
  }
}

export function EmailsClient() {
  const [emails, setEmails] = useState<EmailRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isComposeOpen, setIsComposeOpen] = useState(false);

  useEffect(() => {
    setEmails(getEmails());
  }, []);

  const refreshEmails = () => {
    setEmails(getEmails());
  };

  const filteredEmails = emails.filter((email) => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === "" ||
      email.to.toLowerCase().includes(searchLower) ||
      (email.toName && email.toName.toLowerCase().includes(searchLower)) ||
      email.subject.toLowerCase().includes(searchLower);

    const matchesType = typeFilter === "all" || email.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || email.status === statusFilter;

    return matchesSearch && matchesType && matchesStatus;
  });

  const isFiltered =
    searchTerm !== "" || typeFilter !== "all" || statusFilter !== "all";

  return (
    <main className="container py-8 max-w-[1400px] mx-auto px-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-semibold">Emails</h1>
          <span className="text-sm text-muted-foreground">
            {isFiltered
              ? `${filteredEmails.length} of ${emails.length} emails`
              : `${emails.length} emails`}
          </span>
        </div>
        <Button
          onClick={() => setIsComposeOpen(true)}
          className="gap-2 bg-orange-500 hover:bg-orange-600 text-white"
        >
          <Plus className="w-4 h-4" />
          Compose
        </Button>
      </div>

      <div className="mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow max-w-md">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search emails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 bg-gray-50 dark:bg-gray-800 border-transparent focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
          />
        </div>

        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "All Types" },
              { value: "verification", label: "Verification" },
              { value: "outreach", label: "Outreach" },
              { value: "follow_up", label: "Follow Up" },
            ] as const
          ).map((item) => (
            <Button
              key={item.value}
              variant={typeFilter === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTypeFilter(item.value)}
              className={
                typeFilter === item.value
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              {item.label}
            </Button>
          ))}
        </div>

        <div className="flex gap-2">
          {(
            [
              { value: "all", label: "All" },
              { value: "sent", label: "Sent" },
              { value: "delivered", label: "Delivered" },
              { value: "failed", label: "Failed" },
            ] as const
          ).map((item) => (
            <Button
              key={item.value}
              variant={statusFilter === item.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(item.value)}
              className={
                statusFilter === item.value
                  ? "bg-orange-500 hover:bg-orange-600"
                  : ""
              }
            >
              {item.label}
            </Button>
          ))}
        </div>
      </div>

      {filteredEmails.length > 0 ? (
        <div className="space-y-2">
          {filteredEmails.map((email) => {
            const isExpanded = expandedId === email.id;
            return (
              <div
                key={email.id}
                className="rounded-lg border bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600 transition-colors cursor-pointer"
                onClick={() =>
                  setExpandedId(isExpanded ? null : email.id)
                }
              >
                <div className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-medium text-sm truncate">
                        {email.toName || email.to}
                      </span>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 border-transparent ${getTypeBadgeClasses(email.type)}`}
                      >
                        {formatType(email.type)}
                      </Badge>
                      <Badge
                        className={`text-[10px] px-1.5 py-0 border-transparent ${getStatusBadgeClasses(email.status)}`}
                      >
                        {email.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {email.subject}
                    </p>
                    {!email.toName && null}
                    {email.toName && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {email.to}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {timeAgo(email.sentAt)}
                    </span>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-4 border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">To:</span>{" "}
                        <span className="font-medium">{email.to}</span>
                      </div>
                      {email.toName && (
                        <div>
                          <span className="text-muted-foreground">Name:</span>{" "}
                          <span className="font-medium">{email.toName}</span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground">Sent:</span>{" "}
                        <span className="font-medium">
                          {new Date(email.sentAt).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Type:</span>{" "}
                        <span className="font-medium">
                          {formatType(email.type)}
                        </span>
                      </div>
                    </div>
                    {email.body && (
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-md p-4">
                        <p className="text-sm whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                          {email.body}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
            <Inbox className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No emails found
          </h3>
          <p className="text-sm text-muted-foreground mb-4">
            {isFiltered
              ? "No emails match your current filters."
              : "You haven't sent any emails yet. Click 'Compose' to get started."}
          </p>
          {!isFiltered && (
            <Button
              onClick={() => setIsComposeOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Compose Email
            </Button>
          )}
        </div>
      )}

      <ComposeEmailModal
        isOpen={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        onSent={refreshEmails}
      />
    </main>
  );
}
