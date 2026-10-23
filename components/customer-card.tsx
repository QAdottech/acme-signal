import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { OrganizationImage } from "@/components/organization-image";
import type { Organization } from "@/types/organization";
import { DollarSign } from "lucide-react";

interface CustomerCardProps {
  customers: Organization[];
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export function CustomerCard({ customers, trend }: CustomerCardProps) {
  const preview = customers.slice(0, 3);
  const remaining = customers.length - preview.length;

  return (
    <Card className="overflow-hidden border-emerald-200 dark:border-emerald-900">
      <div className="h-1 bg-emerald-500" aria-hidden="true" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
        <DollarSign className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{customers.length}</div>
        <p className="text-xs text-muted-foreground mt-1">Current customers</p>
        {trend && (
          <p
            className={`text-xs mt-1 ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}% from last
            month
          </p>
        )}
        {preview.length > 0 ? (
          <ul className="mt-3 space-y-1.5">
            {preview.map((org) => (
              <li key={org.id}>
                <Link
                  href={`/organizations/${org.id}`}
                  className="flex items-center gap-2 min-w-0 rounded-md px-1 py-0.5 -mx-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                >
                  <span className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full bg-muted">
                    <OrganizationImage
                      src={org.logo || "/placeholder.svg"}
                      alt=""
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                  </span>
                  <span className="truncate text-xs font-medium">{org.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-xs text-muted-foreground">
            No current customers yet.
          </p>
        )}
        {remaining > 0 && (
          <Link
            href="/organizations"
            className="mt-2 inline-block text-xs font-medium text-emerald-700 hover:underline dark:text-emerald-400"
          >
            +{remaining} more
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
