import { PageHeader } from "@/components/page-header";

/**
 * Full-height list page: header and toolbar on top, a scrolling grid that
 * fills the rest of the window (its header row stays pinned), and a status
 * line underneath.
 */
export function RecordListLayout({
  title,
  description,
  actions,
  toolbar,
  status,
  children,
}: {
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  toolbar?: React.ReactNode;
  status?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <main className="flex h-full min-h-0 flex-col">
      <div className="px-8 pt-6">
        <PageHeader title={title} description={description} actions={actions} className="mb-4" />
        {toolbar && <div className="mb-3 flex flex-wrap items-center gap-2">{toolbar}</div>}
      </div>
      <div className="min-h-0 flex-1 overflow-auto border-t">{children}</div>
      {status && (
        <div className="flex h-8 shrink-0 items-center gap-3 border-t bg-sidebar px-8 text-xs text-muted-foreground">
          {status}
        </div>
      )}
    </main>
  );
}
