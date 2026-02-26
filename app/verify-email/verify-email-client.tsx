"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );

  useEffect(() => {
    const token = searchParams.get("token");
    const email = searchParams.get("email");

    if (!token || !email) {
      setStatus("error");
      return;
    }

    // Verify the token against localStorage
    const storedTokens = localStorage.getItem("verification-tokens");
    if (storedTokens) {
      try {
        const tokens: Record<string, string> = JSON.parse(storedTokens);
        if (tokens[email] === token) {
          // Token is valid - mark user as verified
          const storedUsers = localStorage.getItem("users");
          if (storedUsers) {
            const users = JSON.parse(storedUsers);
            const updatedUsers = users.map(
              (u: { email: string; emailVerified?: boolean }) =>
                u.email.toLowerCase() === email.toLowerCase()
                  ? { ...u, emailVerified: true }
                  : u
            );
            localStorage.setItem("users", JSON.stringify(updatedUsers));

            // Also update current user if it matches
            const storedUser = localStorage.getItem("user");
            if (storedUser) {
              const currentUser = JSON.parse(storedUser);
              if (currentUser.email.toLowerCase() === email.toLowerCase()) {
                currentUser.emailVerified = true;
                localStorage.setItem("user", JSON.stringify(currentUser));
              }
            }
          }

          // Clean up the used token
          delete tokens[email];
          localStorage.setItem(
            "verification-tokens",
            JSON.stringify(tokens)
          );

          setStatus("success");
          return;
        }
      } catch {
        // Fall through to error
      }
    }

    setStatus("error");
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 rounded-xl bg-[#2D1A45] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">A</span>
          </div>

          {status === "loading" && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verifying your email...
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Please wait while we verify your email address.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Email verified!
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Your email has been verified successfully. You can now access
                all features of ACME Signal.
              </p>
              <Button
                onClick={() => router.push("/")}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              >
                Go to Dashboard
              </Button>
            </div>
          )}

          {status === "error" && (
            <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Verification failed
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                This verification link is invalid or has expired. Please try
                signing up again.
              </p>
              <Link href="/signup">
                <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                  Back to Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
