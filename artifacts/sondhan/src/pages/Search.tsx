import { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { useListLostItems, useListFoundItems } from "@workspace/api-client-react";
import { formatDate, CATEGORIES, STATUS_COLORS } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Search() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");

  const { data: lostItems, isLoading: loadingLost } = useListLostItems({
    search: search || undefined,
    category: category === "all" ? undefined : category,
    limit: 50,
  });
  const { data: foundItems, isLoading: loadingFound } = useListFoundItems({
    search: search || undefined,
    category: category === "all" ? undefined : category,
    limit: 50,
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Search Lost &amp; Found Items</h1>

        <div className="flex gap-3 mb-6">
          <Input
            data-testid="input-search"
            placeholder="Search by title or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1"
          />
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger data-testid="select-category" className="w-44">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="lost">
          <TabsList className="mb-4">
            <TabsTrigger data-testid="tab-lost" value="lost">
              Lost Items {lostItems?.total != null ? `(${lostItems.total})` : ""}
            </TabsTrigger>
            <TabsTrigger data-testid="tab-found" value="found">
              Found Items {foundItems?.total != null ? `(${foundItems.total})` : ""}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="lost">
            {loadingLost ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : lostItems?.items?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No lost items found matching your search.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {lostItems?.items?.map((item) => (
                  <div key={item.id} data-testid={`card-lost-${item.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{item.lastSeenLocation ?? "Location unknown"}</span>
                      <span>&bull;</span>
                      <span>{formatDate(item.dateLost)}</span>
                    </div>
                    {item.reporterName && <p className="text-xs text-muted-foreground mt-1">Reported by: {item.reporterName}</p>}
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="found">
            {loadingFound ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : foundItems?.items?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">No found items matching your search.</div>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {foundItems?.items?.map((item) => (
                  <div key={item.id} data-testid={`card-found-${item.id}`} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-sm leading-tight">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{item.category}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{item.foundLocation ?? "Location unknown"}</span>
                      <span>&bull;</span>
                      <span>{formatDate(item.dateFound)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
