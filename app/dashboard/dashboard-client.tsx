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
import { Organization } from "@/types/organization";
import { Person } from "@/types/person";
import { Activity } from "@/types/activity";
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
  const [showActiveDealsModal, setShowActiveDealsModal] = useState(false);

  useEffect(() => {
    setOrganizations(getOrganizations());
    setPeople(getPeople());
    setActivities(getActivities());
  }, []);

  // Calculate stats
  const portfolioCompanies = organizations.filter(
    (org) => org.assessmentStatus === "Portfolio company"
  ).length;

  const activeDealOrganizations = organizations.filter(
    (org) =>
      org.assessmentStatus === "Screening" ||
      org.assessmentStatus === "Hitlist" ||
      org.assessmentStatus === "Preparing for NDC"
  );

  const activeDeals = activeDealOrganizations.length;

  const activePeople = people.filter(
    (person) => person.status === "Active"
  ).length;

  // Prepare chart data
  const statusData = [
    {
      name: "Screening",
      count: organizations.filter((o) => o.assessmentStatus === "Screening")
        .length,
    },
    {
      name: "Hitlist",
      count: organizations.filter((o) => o.assessmentStatus === "Hitlist")
        .length,
    },
    {
      name: "Preparing for NDC",
      count: organizations.filter(
        (o) => o.assessmentStatus === "Preparing for NDC"
      ).length,
    },
    {
      name: "Portfolio",
      count: organizations.filter(
        (o) => o.assessmentStatus === "Portfolio company"
      ).length,
    },
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
    { month: "Jan", deals: 12, people: 24 },
    { month: "Feb", deals: 15, people: 28 },
    { month: "Mar", deals: 18, people: 35 },
    { month: "Apr", deals: 22, people: 42 },
    { month: "May", deals: 25, people: 48 },
    { month: "Jun", deals: organizations.length, people: people.length },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container py-8 max-w-[1400px] mx-auto px-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your deal pipeline and activities
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
            title="Active Deals"
            value={activeDeals}
            description="In screening or hitlist"
            icon={Target}
            trend={{ value: 8, isPositive: true }}
            onClick={() => setShowActiveDealsModal(true)}
          />
          <StatsCard
            title="Portfolio Companies"
            value={portfolioCompanies}
            description="Current investments"
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
              <CardTitle>Deals by Status</CardTitle>
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
                    dataKey="deals"
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

      {/* Active Deals Modal */}
      <ActiveDealsModal
        isOpen={showActiveDealsModal}
        onClose={() => setShowActiveDealsModal(false)}
        deals={activeDealOrganizations}
      />
    </div>
  );
}
