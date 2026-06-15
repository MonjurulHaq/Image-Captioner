import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import AppShell from "@/components/layout/AppShell";
import { useListLostItems, useListFoundItems, useListClaims, useListNotifications } from "@workspace/api-client-react";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { user } = useAuth();
  const { data: lostItems, isLoading: loadingLost } = useListLostItems({ limit: 5 });
  const { data: foundItems, isLoading: loadingFound } = useListFoundItems({ limit: 5 });
  const { data: claims, isLoading: loadingClaims } = useListClaims({ limit: 5 });
  const { data: notifications, isLoading: loadingNotif } = useListNotifications({ limit: 5 });

  const unreadCount = notifications?.items?.filter((n) => !n.isRead).length ?? 0;

  const stats = [
    { label: "Lost Items Reported", value: lostItems?.total ?? 0, href: "/lost-items", color: "text-red-400" },
    { label: "Found Items", value: foundItems?.total ?? 0, href: "/found-items", color: "text-emerald-400" },
    { label: "My Claims", value: claims?.total ?? 0, href: "/claims", color: "text-amber-400" },
    { label: "Unread Notifications", value: unreadCount, href: "/notifications", color: "text-blue-400" },
  ];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{user?.department} &bull; {user?.universityId} &bull; <span className="text-primary">{user?.role}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {stats.map((s) => (
            <Link key={s.label} href={s.href}>
              <div data-testid={`stat-${s.label.toLowerCase().replace(/ /g, "-")}`} className="bg-card border border-border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
                {loadingLost ? <Skeleton className="h-8 w-12 mb-1" /> : (
                  <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
                )}
                <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/lost-items">
              <span data-testid="button-report-lost" className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                Report Lost Item
              </span>
            </Link>
            <Link href="/found-items">
              <span data-testid="button-report-found" className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                Report Found Item
              </span>
            </Link>
            <Link href="/search">
              <span data-testid="button-search" className="bg-card border border-border text-foreground hover:bg-muted px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                Search All Items
              </span>
            </Link>
            <Link href="/ai-assistant">
              <span data-testid="button-ai-assistant" className="bg-accent/10 border border-accent/20 text-accent hover:bg-accent/20 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors">
                AI Assistant
              </span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Lost Items */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Recent Lost Items</h2>
              <Link href="/lost-items"><span className="text-xs text-primary hover:underline cursor-pointer">View all</span></Link>
            </div>
            <div className="space-y-2">
              {loadingLost ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
              ) : lostItems?.items?.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No lost items reported</p>
              ) : (
                lostItems?.items?.slice(0, 4).map((item) => (
                  <div key={item.id} data-testid={`item-lost-${item.id}`} className="bg-card border border-border rounded-lg px-4 py-3 flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.category} &bull; {formatDate(item.createdAt)}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Notifications */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold">Notifications</h2>
              <Link href="/notifications"><span className="text-xs text-primary hover:underline cursor-pointer">View all</span></Link>
            </div>
            <div className="space-y-2">
              {loadingNotif ? (
                Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)
              ) : notifications?.items?.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No notifications</p>
              ) : (
                notifications?.items?.slice(0, 4).map((n) => (
                  <div key={n.id} data-testid={`notif-${n.id}`} className={`bg-card border rounded-lg px-4 py-3 ${n.isRead ? "border-border" : "border-primary/30 bg-primary/5"}`}>
                    <p className="text-sm font-medium">{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.message}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
