import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Navbar() {
  const { isAuthenticated } = useAuth();

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <span className="text-xl font-bold text-primary cursor-pointer tracking-tight">Sondhan AI</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link href="/search">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Search</span>
          </Link>
          {isAuthenticated ? (
            <Link href="/dashboard">
              <span className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md cursor-pointer hover:opacity-90 transition-opacity">Dashboard</span>
            </Link>
          ) : (
            <>
              <Link href="/login">
                <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">Login</span>
              </Link>
              <Link href="/register">
                <span className="text-sm bg-primary text-primary-foreground px-3 py-1.5 rounded-md cursor-pointer hover:opacity-90 transition-opacity">Register</span>
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
