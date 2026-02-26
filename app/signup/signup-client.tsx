"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { SignupStep2 } from "@/components/signup-step2";

export function SignupClient() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { signup } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate password length
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setStep(2);
  };

  const handleSignup = (fullName: string, avatar: string) => {
    const success = signup(email, password, fullName, avatar);
    if (success) {
      router.push("/");
    } else {
      setError("Failed to create account");
    }
  };

  const handleSkip = () => {
    const success = signup(email, password);
    if (success) {
      router.push("/");
    } else {
      setError("Failed to create account");
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
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
              Create your account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Get started with ACME Signal
            </p>
            {step === 1 ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label
                    htmlFor="email"
                    className="text-gray-700 dark:text-gray-300"
                  >
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
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="mt-1.5 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                    placeholder="At least 8 characters"
                  />
                </div>
                <div>
                  <Label
                    htmlFor="confirmPassword"
                    className="text-gray-700 dark:text-gray-300"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="mt-1.5 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
                    placeholder="Re-enter your password"
                  />
                </div>
                {error && (
                  <p className="text-red-500 dark:text-red-400 text-sm">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Continue
                </Button>
              </form>
            ) : (
              <SignupStep2 onSignup={handleSignup} onSkip={handleSkip} />
            )}
          </div>
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-orange-500 hover:text-orange-600 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
