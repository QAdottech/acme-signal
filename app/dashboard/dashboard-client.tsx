"use client";

import { useEffect, useState } from "react";
import { StatsCard } from "@/components/stats-card";
import { ActivityFeed } from "@/components/activity-feed";
import { ActiveDealsModal } from "@/components/active-deals-modal";
import {
  Building2,
  Users,
  FolderKanban,
  TrendingUp,
  DollarSign,
  Target,
} from "lucide-react";
import { getOrganizations } from "@/lib/organizationData";
import { getPeople } from "@/lib/personData";
import { getActivities } from "@/lib/activityData";
import { getDeals, formatDealValue } from "@/lib/dealData";
import { Organization } from "@/types/organization";
import { Person } from "@/types/person";
import { Activity } from "@/types/activity";
import type { Deal } from "@/types/deal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";

export function DashboardClient() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [showPipelineModal, setShowPipelineModal] = useState(false);

  useEffect(() => {
    setOrganizations(getOrganizations());
    setPeople(getPeople());
    setActivities(getActivities());
    setDeals(getDeals());
  }, []);

  // Calculate stats
  const activeCustomers = organizations.filter(
    (org) => org.dealStage === "Customer"
  ).length;

  const pipelineOrganizations = organizations.filter(
    (org) =>
      org.dealStage === "Lead" ||
      org.dealStage === "Qualified" ||
      org.dealStage === "Proposal" ||
      org.dealStage === "Negotiation"
  );

  const pipelineDeals = deals.filter((d) =>
    ["Lead", "Qualified", "Proposal", "Negotiation"].includes(d.stage)
  );
  const totalPipelineValue = pipelineDeals.reduce((sum, d) => sum + d.value, 0);

  const activePeople = people.filter(
    (person) => person.status === "Active"
  ).length;

  // Prepare chart data
  const statusData = [
    { name: "Lead", count: deals.filter((d) => d.stage === "Lead").length },
    { name: "Qualified", count: deals.filter((d) => d.stage === "Qualified").length },
    { name: "Proposal", count: deals.filter((d) => d.stage === "Proposal").length },
    { name: "Negotiation", count: deals.filter((d) => d.stage === "Negotiation").length },
  ];

  const industryData = organizations.reduce((acc, org) => {
    const existing = acc.find((item) => item.name === org.industry);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: org.industry, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  const locationData = organizations.reduce((acc, org) => {
    const existing = acc.find((item) => item.name === org.location);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ name: org.location, count: 1 });
    }
    return acc;
  }, [] as { name: string; count: number }[]);

  const COLORS = [
    "#f97316",
    "#3b82f6",
    "#10b981",
    "#8b5cf6",
    "#ef4444",
    "#f59e0b",
  ];

  // Mock growth data
  const growthData = [
    { month: "Jan", companies: 12, people: 24 },
    { month: "Feb", companies: 15, people: 28 },
    { month: "Mar", companies: 18, people: 35 },
    { month: "Apr", companies: 22, people: 42 },
    { month: "May", companies: 25, people: 48 },
    { month: "Jun", companies: organizations.length, people: people.length },
  ];

  return (
    <>
      <main className="container py-8 max-w-[1400px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your CRM pipeline and activities
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatsCard
            title="Total Organizations"
            value={organizations.length}
            description="Companies in pipeline"
            icon={Building2}
            trend={{ value: 12, isPositive: true }}
          />
          <StatsCard
            title="Active Pipeline"
            value={pipelineDeals.length}
            description={formatDealValue(totalPipelineValue) + " total value"}
            icon={Target}
            trend={{ value: 8, isPositive: true }}
            onClick={() => setShowPipelineModal(true)}
          />
          <StatsCard
            title="Active Customers"
            value={activeCustomers}
            description="Current customers"
            icon={DollarSign}
            trend={{ value: 5, isPositive: true }}
          />
          <StatsCard
            title="Active Contacts"
            value={activePeople}
            description="People in network"
            icon={Users}
            trend={{ value: 15, isPositive: true }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Pipeline by Stage</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statusData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#f97316" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Industry Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={industryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {industryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row 2 */}
        <div className="grid gap-6 md:grid-cols-2 mb-6">
          <Card>
            <CardHeader>
              <CardTitle>Growth Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="companies"
                    stroke="#f97316"
                    strokeWidth={2}
                    name="Organizations"
                  />
                  <Line
                    type="monotone"
                    dataKey="people"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    name="Contacts"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Geographic Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={locationData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed */}
        <ActivityFeed activities={activities} maxItems={8} />
      </main>

      {/* Active Pipeline Modal */}
      <ActiveDealsModal
        isOpen={showPipelineModal}
        onClose={() => setShowPipelineModal(false)}
        deals={pipelineDeals}
      />
    </>
  );
}
