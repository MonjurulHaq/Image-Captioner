import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▪" },
  { href: "/lost-items", label: "Lost Items", icon: "▪" },
  { href: "/found-items", label: "Found Items", icon: "▪" },
  { href: "/claims", label: "My Claims", icon: "▪" },
  { href: "/notifications", label: "Notifications", icon: "▪" },
  { href: "/ai-assistant", label: "AI Assistant", icon: "▪" },
  { href: "/profile", label: "Profile", icon: "▪" },
];

const adminItems = [
  { href: "/admin", label: "Overview", icon: "▪" },
  { href: "/admin/claims", label: "Claims Mgmt", icon: "▪" },
  { href: "/admin/users", label: "Users", icon: "▪" },
  { href: "/admin/analytics", label: "Analytics", icon: "▪" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  return (
    <aside className="w-56 flex-shrink-0 flex flex-col border-r border-sidebar-border bg-sidebar h-screen sticky top-0">
      <div className="px-4 py-4 border-b border-sidebar-border">
        <Link href="/dashboard">
          <span className="text-lg font-bold text-primary tracking-tight cursor-pointer">Sondhan AI</span>
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Lost &amp; Found Platform</p>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {navItems.map((item) => (
          <Link key={item.href} href={item.href}>
            <span
              data-testid={`nav-${item.href.replace("/", "")}`}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                location === item.href || location.startsWith(item.href + "/")
                  ? "bg-primary/15 text-primary font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <span className="text-xs">{item.icon}</span>
              {item.label}
            </span>
          </Link>
        ))}

        {user?.role === "Admin" && (
          <>
            <div className="pt-3 pb-1 px-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Admin</p>
            </div>
            {adminItems.map((item) => (
              <Link key={item.href} href={item.href}>
                <span
                  data-testid={`nav-admin-${item.label.toLowerCase().replace(" ", "-")}`}
                  className={cn(
                    "flex items-center gap-2 px-3 py-2 rounded-md text-sm cursor-pointer transition-colors",
                    location === item.href
                      ? "bg-accent/15 text-accent font-medium"
                      : "text-sidebar-foreground hover:bg-sidebar-accent"
                  )}
                >
                  <span className="text-xs">{item.icon}</span>
                  {item.label}
                </span>
              </Link>
            ))}
          </>
        )}
      </nav>

      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
          <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.role}</p>
          </div>
        </div>
        <button
          data-testid="button-logout"
          onClick={logout}
          className="w-full text-left px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-sidebar-accent rounded-md transition-colors"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
