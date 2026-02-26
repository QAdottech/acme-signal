"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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
      // Redirect to the page they were trying to access, or home
      const from = searchParams.get("from") || "/";
      router.push(from);
    } else {
      setError("Invalid email or password");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-10">
        <Image
          src="/logos/acme-full-logo.png"
          alt="ACME Signal"
          width={360}
          height={102}
          className="mx-auto dark:invert"
          priority
        />
      </div>
      <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
          Welcome back
        </h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Sign in to your account
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1.5 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
              placeholder="you@company.com"
            />
          </div>
          <div>
            <Label
              htmlFor="password"
              className="text-gray-700 dark:text-gray-300"
            >
              Password
            </Label>
            <div className="relative mt-1.5">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="pr-10 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                placeholder="Enter your password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center min-w-6 min-h-6 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          {error && (
            <p className="text-red-500 dark:text-red-400 text-sm">{error}</p>
          )}
          <Button
            type="submit"
            className="w-full bg-orange-500 hover:bg-orange-600 text-white"
          >
            Sign in
          </Button>
        </form>
      </div>
      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="text-orange-500 hover:text-orange-600 font-medium"
        >
          Create an account
        </Link>
      </p>
    </div>
  );
}

export function LoginPageClient() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <Suspense
          fallback={
            <div className="w-full max-w-md p-8 animate-pulse h-96" />
          }
        >
          <LoginForm />
        </Suspense>
      </main>
    </div>
  );
}
