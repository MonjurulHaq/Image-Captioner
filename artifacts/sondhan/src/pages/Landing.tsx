import { Link } from "wouter";
import { useListLostItems, useListFoundItems } from "@workspace/api-client-react";
import Navbar from "@/components/layout/Navbar";
import { formatDate, STATUS_COLORS } from "@/lib/utils";

export default function Landing() {
  const { data: lostItems } = useListLostItems({ limit: 4 });
  const { data: foundItems } = useListFoundItems({ limit: 4 });

  const totalLost = lostItems?.total ?? 0;
  const totalFound = foundItems?.total ?? 0;
  const recoveryRate = totalLost + totalFound > 0
    ? Math.round((totalFound / (totalLost + totalFound)) * 100)
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 pt-16 pb-12 text-center">
        <div className="inline-block bg-primary/10 border border-primary/20 text-primary text-xs px-3 py-1 rounded-full mb-4 font-medium">
          Powered by Gemini AI
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          Lost something on campus?<br />
          <span className="text-primary">Sondhan AI</span> will find it.
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-8">
          Bangladesh's first AI-powered university Lost &amp; Found platform. Report, search, and recover lost items with intelligent matching — in Bengali or English.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Link href="/register">
            <span data-testid="link-get-started" className="bg-primary text-primary-foreground px-6 py-3 rounded-lg font-semibold cursor-pointer hover:opacity-90 transition-opacity">
              Get Started
            </span>
          </Link>
          <Link href="/search">
            <span data-testid="link-search-items" className="bg-card border border-border text-foreground px-6 py-3 rounded-lg font-semibold cursor-pointer hover:bg-muted transition-colors">
              Search Items
            </span>
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { label: "Items Reported Lost", value: totalLost },
            { label: "Items Found", value: totalFound },
            { label: "Recovery Rate", value: `${recoveryRate}%` },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <div data-testid={`stat-${stat.label.toLowerCase().replace(/ /g, "-")}`} className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4 pb-12">
        <h2 className="text-2xl font-bold text-center mb-8">How Sondhan Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", title: "Report", desc: "Submit a lost or found item report with details and location." },
            { step: "02", title: "AI Matches", desc: "Gemini AI scans all reports and surfaces potential matches instantly." },
            { step: "03", title: "Claim & Verify", desc: "The rightful owner submits proof and admins approve the return." },
          ].map((s) => (
            <div key={s.step} className="bg-card border border-border rounded-xl p-6">
              <div className="text-4xl font-black text-primary/20 mb-3">{s.step}</div>
              <h3 className="font-bold text-lg mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Lost Items */}
      {(lostItems?.items?.length ?? 0) > 0 && (
        <section className="max-w-6xl mx-auto px-4 pb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Recently Lost</h2>
            <Link href="/search"><span className="text-sm text-primary cursor-pointer hover:underline">View all</span></Link>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
            {lostItems?.items?.map((item) => (
              <div key={item.id} data-testid={`card-lost-${item.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-medium text-sm leading-tight">{item.title}</h3>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                </div>
                <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                <p className="text-xs text-muted-foreground">{item.lastSeenLocation ?? "—"}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatDate(item.createdAt)}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground">
        <p>Sondhan AI &mdash; Smart Lost &amp; Found for Bangladeshi Universities</p>
        <div className="flex justify-center gap-4 mt-2">
          <Link href="/login"><span className="hover:text-foreground cursor-pointer">Login</span></Link>
          <Link href="/register"><span className="hover:text-foreground cursor-pointer">Register</span></Link>
          <Link href="/search"><span className="hover:text-foreground cursor-pointer">Search</span></Link>
        </div>
      </footer>
    </div>
  );
}
