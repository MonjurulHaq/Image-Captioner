import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useListLostItems, useCreateLostItem, useMatchItem, getListLostItemsQueryKey } from "@workspace/api-client-react";
import { formatDate, CATEGORIES, STATUS_COLORS } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const lostItemSchema = z.object({
  title: z.string().min(3, "Title required"),
  category: z.string().min(1, "Category required"),
  description: z.string().min(10, "Description required"),
  dateLost: z.string().optional(),
  lastSeenLocation: z.string().optional(),
});
type LostItemForm = z.infer<typeof lostItemSchema>;

interface MatchResult {
  foundItemId: number;
  score: number;
  reason: string;
  foundItem?: { title: string; foundLocation?: string | null };
}

export default function LostItems() {
  const [open, setOpen] = useState(false);
  const [matchResults, setMatchResults] = useState<Record<number, MatchResult[]>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListLostItems({ limit: 50 });
  const createMutation = useCreateLostItem();
  const matchMutation = useMatchItem();

  const form = useForm<LostItemForm>({
    resolver: zodResolver(lostItemSchema),
    defaultValues: { title: "", category: "", description: "", dateLost: "", lastSeenLocation: "" },
  });

  const onSubmit = (data: LostItemForm) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Lost item reported", description: "Your report has been submitted." });
        queryClient.invalidateQueries({ queryKey: getListLostItemsQueryKey() });
        form.reset();
        setOpen(false);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error ?? "Failed to submit", variant: "destructive" });
      },
    });
  };

  const handleMatch = (lostItemId: number) => {
    matchMutation.mutate({ data: { lostItemId } }, {
      onSuccess: (res: any) => {
        setMatchResults((prev) => ({ ...prev, [lostItemId]: res.matches ?? [] }));
        toast({ title: "AI Matching Complete", description: `Found ${res.matches?.length ?? 0} potential matches` });
      },
      onError: () => {
        toast({ title: "Match failed", description: "Could not run AI matching", variant: "destructive" });
      },
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Lost Items</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} items reported</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-report-lost">Report Lost Item</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Report a Lost Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Item Title</FormLabel><FormControl><Input data-testid="input-title" placeholder="Blue wallet with student ID" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="category" render={({ field }) => (
                    <FormItem><FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger data-testid="select-category"><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
                        <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                      </Select><FormMessage />
                    </FormItem>
                  )} />
                  <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea data-testid="input-description" placeholder="Describe the item in detail..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dateLost" render={({ field }) => (
                    <FormItem><FormLabel>Date Lost</FormLabel><FormControl><Input data-testid="input-date-lost" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="lastSeenLocation" render={({ field }) => (
                    <FormItem><FormLabel>Last Seen Location</FormLabel><FormControl><Input data-testid="input-location" placeholder="CSE Building Cafeteria" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button data-testid="button-submit" type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No lost items reported yet.</div>
        ) : (
          <div className="space-y-4">
            {data?.items?.map((item) => (
              <div key={item.id} data-testid={`card-lost-${item.id}`} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{item.lastSeenLocation ?? "Location unknown"}</span>
                      <span>&bull; Lost {formatDate(item.dateLost)}</span>
                    </div>
                  </div>
                  <Button
                    data-testid={`button-match-${item.id}`}
                    size="sm"
                    variant="outline"
                    onClick={() => handleMatch(item.id)}
                    disabled={matchMutation.isPending}
                    className="flex-shrink-0 text-accent border-accent/30 hover:bg-accent/10"
                  >
                    AI Match
                  </Button>
                </div>

                {matchResults[item.id] && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-semibold text-accent mb-2">AI Match Results ({matchResults[item.id].length} found)</p>
                    {matchResults[item.id].length === 0 ? (
                      <p className="text-xs text-muted-foreground">No matches found yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {matchResults[item.id].map((m) => (
                          <div key={m.foundItemId} data-testid={`match-result-${m.foundItemId}`} className="bg-accent/5 border border-accent/20 rounded-lg p-3">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-bold text-accent">Match Score: {Math.round(m.score * 100)}%</span>
                            </div>
                            <p className="text-xs text-muted-foreground">{m.reason}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
