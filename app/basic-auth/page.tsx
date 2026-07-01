import { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";

export const metadata: Metadata = {
  title: "Authenticated",
};

export default function BasicAuthSuccessPage() {
  return (
    <main className="min-h-[calc(100vh-3.5rem)] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Authentication successful
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          You have been granted access to this protected area.
        </p>
      </div>
    </main>
  );
}
