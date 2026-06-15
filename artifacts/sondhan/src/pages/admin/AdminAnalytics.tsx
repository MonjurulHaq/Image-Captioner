import AppShell from "@/components/layout/AppShell";
import { useGetAnalytics } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";

const PIE_COLORS = ["#10B981", "#F59E0B", "#3B82F6", "#8B5CF6", "#EF4444", "#14B8A6", "#F97316"];

export default function AdminAnalytics() {
  const { data: analytics, isLoading } = useGetAnalytics();

  if (isLoading) {
    return (
      <AppShell>
        <div className="p-6 max-w-5xl mx-auto space-y-4">
          <Skeleton className="h-8 w-48" />
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </AppShell>
    );
  }

  const monthlyData = (analytics as any)?.monthlyStats ?? [];
  const categoryBreakdown = (analytics as any)?.categoryStats ?? [];
  const totalLost = (analytics as any)?.totalLostItems ?? 0;
  const totalFound = (analytics as any)?.totalFoundItems ?? 0;
  const totalReturned = (analytics as any)?.recoveredItems ?? 0;
  const recoveryRate = totalLost + totalFound > 0
    ? Math.round((totalReturned / (totalLost + totalFound)) * 100)
    : 0;

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform statistics and trends</p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Lost", value: totalLost, color: "text-red-400" },
            { label: "Total Found", value: totalFound, color: "text-emerald-400" },
            { label: "Returned", value: totalReturned, color: "text-blue-400" },
            { label: "Recovery Rate", value: `${recoveryRate}%`, color: "text-primary" },
          ].map((s) => (
            <div key={s.label} data-testid={`stat-${s.label.toLowerCase().replace(/ /g, "-")}`} className="bg-card border border-border rounded-xl p-4">
              <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Monthly Bar Chart */}
        {monthlyData.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6">
            <h2 className="font-bold mb-4">Monthly Trends</h2>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Bar dataKey="lost" name="Lost" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="found" name="Found" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recovered" name="Recovered" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Category Pie Chart */}
        {categoryBreakdown.length > 0 && (
          <div className="bg-card border border-border rounded-xl p-5">
            <h2 className="font-bold mb-4">Category Breakdown</h2>
            <div className="flex items-center gap-8">
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={categoryBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    dataKey="count"
                    nameKey="category"
                    label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {categoryBreakdown.map((_: any, idx: number) => (
                      <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {monthlyData.length === 0 && categoryBreakdown.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card border border-border rounded-xl">
            Not enough data for analytics yet.
          </div>
        )}
      </div>
    </AppShell>
  );
}
