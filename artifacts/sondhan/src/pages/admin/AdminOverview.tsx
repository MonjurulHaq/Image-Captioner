import AppShell from "@/components/layout/AppShell";
import { useListLostItems, useListFoundItems, useListClaims, useListUsers } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";

export default function AdminOverview() {
  const { data: lostItems } = useListLostItems({ limit: 1 });
  const { data: foundItems } = useListFoundItems({ limit: 1 });
  const { data: claims } = useListClaims({ limit: 1 });
  const { data: users } = useListUsers({ limit: 1 });

  const pendingClaims = claims?.items?.filter((c) => c.status === "Pending").length ?? 0;

  const stats = [
    { label: "Total Users", value: users?.total ?? 0, href: "/admin/users", color: "text-blue-400" },
    { label: "Lost Items", value: lostItems?.total ?? 0, href: "/lost-items", color: "text-red-400" },
    { label: "Found Items", value: foundItems?.total ?? 0, href: "/found-items", color: "text-emerald-400" },
    { label: "Pending Claims", value: pendingClaims, href: "/admin/claims", color: "text-amber-400" },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Admin Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Platform management dashboard</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <div data-testid={`stat-${s.label.toLowerCase().replace(/ /g, "-")}`} className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
                {s.value === 0 && s.label !== "Pending Claims" ? (
                  <Skeleton className="h-8 w-12 mb-1" />
                ) : (
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <Link href="/admin/claims">
            <div data-testid="card-admin-claims" className="bg-card border border-amber-500/20 rounded-xl p-5 cursor-pointer hover:border-amber-500/40 transition-colors">
              <h3 className="font-bold mb-1 text-amber-400">Claims Management</h3>
              <p className="text-sm text-muted-foreground">Review and approve/reject ownership claims</p>
            </div>
          </Link>
          <Link href="/admin/users">
            <div data-testid="card-admin-users" className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-colors">
              <h3 className="font-bold mb-1">User Management</h3>
              <p className="text-sm text-muted-foreground">View and manage platform users</p>
            </div>
          </Link>
          <Link href="/admin/analytics">
            <div data-testid="card-admin-analytics" className="bg-card border border-border rounded-xl p-5 cursor-pointer hover:border-primary/30 transition-colors">
              <h3 className="font-bold mb-1">Analytics</h3>
              <p className="text-sm text-muted-foreground">View platform statistics and trends</p>
            </div>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
