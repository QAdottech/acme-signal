"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

const highlights = [
  {
    step: "01",
    title: "Pipeline",
    detail: "See every deal in motion, from first conversation to signature.",
  },
  {
    step: "02",
    title: "People",
    detail: "Keep the room, the company, and the history in one place.",
  },
  {
    step: "03",
    title: "Follow-up",
    detail: "Leave the next step written down before you close the tab.",
  },
];

function BrandMark({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white"
      >
        A
      </span>
      <span className="text-[15px] font-semibold tracking-tight text-stone-950 dark:text-white">
        ACME Signal
      </span>
    </div>
  );
}

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [credential, setCredential] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (credential.length < 8) {
      setError("Password must be at least 8 characters long"); // pragma: allowlist secret
      return;
    }

    const success = login(email, credential);
    if (success) {
      const from = searchParams.get("from") || "/";
      router.push(from);
    } else {
      setError("Invalid email or password"); // pragma: allowlist secret
    }
  };

  return (
    <div className="w-full max-w-[420px]">
      <BrandMark className="mb-8 lg:hidden" />
      <div className="rounded-2xl border border-stone-200/90 bg-white px-6 py-8 shadow-[0_24px_60px_-32px_rgba(28,20,16,0.45)] dark:border-gray-800 dark:bg-gray-900 sm:px-8 sm:py-10">
        <h1 className="text-[1.65rem] font-semibold tracking-tight text-stone-950 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-stone-500 dark:text-gray-400">
          Sign in with your workspace email to open the pipeline.
        </p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          <div>
            <Label htmlFor="email" className="text-stone-700 dark:text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={error ? true : undefined}
              className="mt-2 h-11 rounded-lg border-stone-300 bg-stone-50 px-3.5 shadow-none dark:border-gray-700 dark:bg-gray-950"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label
              htmlFor="password" // pragma: allowlist secret
              className="text-stone-700 dark:text-gray-300"
            >
              {"Password" /* pragma: allowlist secret */}
            </Label>
            <div className="relative mt-2">
              <Input
                id="password" // pragma: allowlist secret
                name="password" // pragma: allowlist secret
                type={revealed ? "text" : "password"} // pragma: allowlist secret
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password" // pragma: allowlist secret
                aria-invalid={error ? true : undefined}
                className="h-11 rounded-lg border-stone-300 bg-stone-50 px-3.5 pr-12 shadow-none dark:border-gray-700 dark:bg-gray-950"
                placeholder="Enter your password" // pragma: allowlist secret
              />
              <button
                type="button"
                onClick={() => setRevealed(!revealed)}
                className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-stone-400 hover:bg-stone-200/70 hover:text-stone-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 dark:hover:bg-gray-800 dark:hover:text-gray-200"
                aria-label={revealed ? "Hide password" : "Show password"} // pragma: allowlist secret
                aria-pressed={revealed}
              >
                {revealed ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error ? (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-600 dark:border-red-900/70 dark:bg-red-950/40 dark:text-red-400"
            >
              {error}
            </p>
          ) : null}
          <Button
            type="submit"
            className="h-11 w-full rounded-lg bg-orange-500 text-[15px] font-medium text-white shadow-sm hover:bg-orange-600"
          >
            Sign in
          </Button>
        </form>
      </div>
    </div>
  );
}

function LoginFormFallback() {
  return (
    <div className="w-full max-w-[420px] animate-pulse" aria-hidden>
      <div className="rounded-2xl border border-stone-200 bg-white px-8 py-10 dark:border-gray-800 dark:bg-gray-900">
        <div className="h-8 w-44 rounded-md bg-stone-200 dark:bg-gray-800" />
        <div className="mt-3 h-4 w-64 rounded bg-stone-200 dark:bg-gray-800" />
        <div className="mt-8 h-11 rounded-lg bg-stone-200 dark:bg-gray-800" />
        <div className="mt-5 h-11 rounded-lg bg-stone-200 dark:bg-gray-800" />
        <div className="mt-5 h-11 rounded-lg bg-orange-200 dark:bg-orange-950" />
      </div>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-2">
      <aside className="relative hidden overflow-hidden bg-[#1a1614] text-stone-100 lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12 xl:px-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-orange-500"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-24 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl"
        />
        <div className="relative flex items-center gap-2.5">
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500 text-sm font-semibold text-white"
          >
            A
          </span>
          <span className="text-[15px] font-semibold tracking-tight text-white">
            ACME Signal
          </span>
        </div>
        <div className="relative max-w-md">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-orange-300/90">
            Workspace
          </p>
          <h2 className="mt-4 text-4xl font-semibold leading-[1.12] tracking-tight text-white xl:text-[2.75rem]">
            Pick up every deal where the last note left off.
          </h2>
          <ol className="mt-10 space-y-6">
            {highlights.map((item) => (
              <li key={item.step} className="grid grid-cols-[auto_1fr] gap-x-4">
                <span className="pt-0.5 text-xs font-medium tracking-wider text-orange-300">
                  {item.step}
                </span>
                <div>
                  <p className="text-sm font-medium text-white">{item.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-stone-400">
                    {item.detail}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
        <p className="relative text-sm text-stone-500">
          CRM for the team that shares one board.
        </p>
      </aside>
      <main className="flex min-h-dvh items-center justify-center bg-[#f4f1ec] px-5 py-12 dark:bg-gray-950 sm:px-8">
        <Suspense fallback={<LoginFormFallback />}>
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
