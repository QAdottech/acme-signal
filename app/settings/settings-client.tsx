"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { toast } from "sonner";
import { Bug, Copy, RotateCcw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/page-header";
import { Avatar } from "@/components/record-table/cells";
import { useConfirm } from "@/components/confirm-dialog";
import { resetDemoData } from "@/lib/demo-data";
import {
  DEMO_BUGS,
  getEnabledDemoBugs,
  setEnabledDemoBugs,
  type DemoBugId,
} from "@/lib/demo-bugs";

/** Two-column settings row: what it is on the left, the controls on the right. */
function SettingsSection({
  id,
  title,
  description,
  children,
}: {
  id?: string;
  title: string;
  description: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="grid scroll-mt-6 gap-6 border-t py-8 md:grid-cols-[240px_minmax(0,1fr)]">
      <div>
        <h2 className="text-sm font-semibold">{title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed text-muted-foreground">{description}</p>
      </div>
      <div className="min-w-0">{children}</div>
    </section>
  );
}

export function SettingsClient() {
  const { user, updateUser } = useAuth();
  const confirm = useConfirm();
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState("");
  const [enabledBugs, setEnabledBugs] = useState<DemoBugId[]>([]);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setAvatar(user.avatar);
    }
  }, [user]);

  useEffect(() => {
    const refresh = () => setEnabledBugs(getEnabledDemoBugs());
    refresh();
    window.addEventListener("demo-bugs-updated", refresh);
    return () => window.removeEventListener("demo-bugs-updated", refresh);
  }, []);

  if (!user) return null;

  const saveProfile = (event: React.FormEvent) => {
    event.preventDefault();
    updateUser({ fullName: fullName.trim() || user.fullName, avatar });
    toast.success("Profile saved");
  };

  const handleAvatar = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") setAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleReset = async () => {
    const ok = await confirm({
      title: "Reset demo data?",
      description:
        "Companies, people, deals, notes, tasks, emails and notifications go back to the seeded demo data. Your login, custom reports and demo bug switches are kept.",
      confirmLabel: "Reset data",
    });
    if (!ok) return;
    resetDemoData();
    // Full reload so every page and the sidebar counts start from the fresh seed.
    window.location.assign("/?reset=1");
  };

  const toggleBug = (id: DemoBugId, on: boolean) => {
    setEnabledDemoBugs(on ? [...enabledBugs, id] : enabledBugs.filter((bug) => bug !== id));
  };

  const demoLink = () => {
    const url = new URL("/", window.location.origin);
    url.searchParams.set("demoBugs", enabledBugs.length ? enabledBugs.join(",") : "none");
    return url.toString();
  };

  return (
    <main className="mx-auto w-full max-w-[960px] px-8 py-6">
      <PageHeader title="Settings" description="Your profile and this demo workspace." />

      <SettingsSection title="Profile" description="How you appear on notes, tasks and activity.">
        <form onSubmit={saveProfile} className="max-w-md space-y-4">
          <div className="flex items-center gap-4">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="" className="h-12 w-12 rounded-full object-cover" />
            ) : (
              <Avatar name={fullName || user.fullName} size={24} className="h-12 w-12 text-sm" />
            )}
            <div>
              <Label htmlFor="avatar" className="text-[13px]">Profile photo</Label>
              <Input id="avatar" type="file" accept="image/*" onChange={handleAvatar} className="mt-1 h-8 text-xs" />
            </div>
          </div>
          <div>
            <Label htmlFor="fullName" className="text-[13px]">Full name</Label>
            <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1" required />
          </div>
          <div>
            <Label htmlFor="email" className="text-[13px]">Email</Label>
            <Input id="email" value={user.email} disabled className="mt-1" />
          </div>
          <Button type="submit">Save profile</Button>
        </form>
      </SettingsSection>

      <SettingsSection
        id="demo-data"
        title="Demo data"
        description="Put the workspace back to its starting state between demos. Data lives in this browser only."
      >
        <div className="flex items-center justify-between gap-4 rounded-lg border px-4 py-3">
          <div className="text-[13px]">
            <div className="font-medium">Reset demo data</div>
            <div className="text-muted-foreground">Restores the seeded companies, people, deals and activity, dated relative to today.</div>
          </div>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw />
            Reset
          </Button>
        </div>
      </SettingsSection>

      <SettingsSection
        id="demo-bugs"
        title="Demo bugs"
        description={
          <>
            Deliberate defects for QA.tech demos. All are off by default. Turn one on to give the agents something
            specific to find. A link with <code className="rounded bg-muted px-1 text-xs">?demoBugs=</code> sets them in
            any browser.
          </>
        }
      >
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="mr-auto flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <Bug className="h-3.5 w-3.5" />
            {enabledBugs.length === 0 ? "No bugs on" : `${enabledBugs.length} of ${DEMO_BUGS.length} on`}
          </span>
          <Button variant="ghost" size="sm" onClick={() => setEnabledDemoBugs([])} disabled={enabledBugs.length === 0}>
            Turn all off
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await navigator.clipboard?.writeText(demoLink());
              toast.success("Demo link copied", { description: demoLink() });
            }}
          >
            <Copy />
            Copy demo link
          </Button>
        </div>
        <ul className="divide-y overflow-hidden rounded-lg border">
          {DEMO_BUGS.map((bug) => {
            const on = enabledBugs.includes(bug.id);
            const switchId = `demo-bug-${bug.id}`;
            return (
              <li key={bug.id} className="flex items-start gap-4 px-4 py-3">
                <div className="min-w-0 flex-1 text-[13px]">
                  <label htmlFor={switchId} className="font-medium">
                    {bug.title}
                  </label>
                  <p className="mt-0.5 text-muted-foreground">{bug.symptom}</p>
                  <p className="mt-1 text-xs text-muted-foreground/80">
                    {bug.area} · <code>{bug.id}</code>
                  </p>
                </div>
                <Switch id={switchId} checked={on} onCheckedChange={(value) => toggleBug(bug.id, value)} className="mt-0.5" />
              </li>
            );
          })}
        </ul>
      </SettingsSection>
    </main>
  );
}
