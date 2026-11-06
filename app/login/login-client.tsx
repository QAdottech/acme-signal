"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { safeReturnPath } from "@/lib/safe-path";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    const success = login(email, password);
    if (success) {
      // Redirect to the page they were trying to access, or home. Only
      // same-site paths are followed (see safeReturnPath for the tricks).
      const target = safeReturnPath(searchParams.get("from"), window.location.origin);
      if (/[?&](resetDemo|demoBugs)=/.test(target)) {
        // Demo links change stored data, so load the page fresh instead of
        // navigating client-side and reloading mid-navigation.
        window.location.assign(target);
      } else {
        router.push(target);
      }
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-[360px]">
      <div className="mb-8 flex flex-col items-center text-center">
        <Image src="/logos/acme-icon.png" alt="ACME Signal" width={54} height={40} className="mb-5 dark:invert" priority />
        <h1 className="text-xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-[13px] text-muted-foreground">Sign in to ACME Signal</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-[13px]">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
            autoFocus
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password" className="text-[13px]">
            Password
          </Label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              className="pr-10"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-1.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>
        {error && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-[13px] text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}
        <Button type="submit" className="w-full">
          Sign in
        </Button>
      </form>
      <p className="mt-8 text-center text-xs text-muted-foreground">
        ACME Signal is a demo CRM. Your data stays in this browser.
      </p>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <Suspense fallback={<div className="h-96 w-full max-w-[360px]" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
