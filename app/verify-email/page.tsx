import { Metadata } from "next";
import { Suspense } from "react";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify Email",
};

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md text-center">
          <div className="w-12 h-12 rounded-xl bg-[#2D1A45] flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-xl">A</span>
          </div>
          <div className="bg-white dark:bg-gray-900 p-8 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Loading verification…
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<VerifyEmailFallback />}>
      <VerifyEmailClient />
    </Suspense>
  );
}
