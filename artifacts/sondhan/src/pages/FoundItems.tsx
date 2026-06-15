import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useListFoundItems, useCreateFoundItem, useCreateClaim, getListFoundItemsQueryKey, getListClaimsQueryKey } from "@workspace/api-client-react";
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

const foundItemSchema = z.object({
  title: z.string().min(3, "Title required"),
  category: z.string().min(1, "Category required"),
  description: z.string().min(10, "Description required"),
  dateFound: z.string().optional(),
  foundLocation: z.string().optional(),
  finderContact: z.string().optional(),
});
type FoundItemForm = z.infer<typeof foundItemSchema>;

const claimSchema = z.object({
  proofText: z.string().min(20, "Please provide more detail to prove ownership"),
});
type ClaimForm = z.infer<typeof claimSchema>;

export default function FoundItems() {
  const [open, setOpen] = useState(false);
  const [claimItemId, setClaimItemId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, isLoading } = useListFoundItems({ limit: 50 });
  const createMutation = useCreateFoundItem();
  const claimMutation = useCreateClaim();

  const form = useForm<FoundItemForm>({
    resolver: zodResolver(foundItemSchema),
    defaultValues: { title: "", category: "", description: "", dateFound: "", foundLocation: "", finderContact: "" },
  });

  const claimForm = useForm<ClaimForm>({
    resolver: zodResolver(claimSchema),
    defaultValues: { proofText: "" },
  });

  const onSubmit = (data: FoundItemForm) => {
    createMutation.mutate({ data }, {
      onSuccess: () => {
        toast({ title: "Found item reported!", description: "Thank you for reporting this item." });
        queryClient.invalidateQueries({ queryKey: getListFoundItemsQueryKey() });
        form.reset();
        setOpen(false);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error ?? "Failed to submit", variant: "destructive" });
      },
    });
  };

  const onClaim = (data: ClaimForm) => {
    if (!claimItemId) return;
    claimMutation.mutate({ data: { itemType: "found", itemId: claimItemId, proofText: data.proofText } }, {
      onSuccess: () => {
        toast({ title: "Claim submitted!", description: "Your claim is pending admin review." });
        queryClient.invalidateQueries({ queryKey: getListClaimsQueryKey() });
        claimForm.reset();
        setClaimItemId(null);
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error ?? "Failed to submit claim", variant: "destructive" });
      },
    });
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Found Items</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} items found</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button data-testid="button-report-found" className="bg-emerald-600 hover:bg-emerald-700">Report Found Item</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Report a Found Item</DialogTitle></DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                  <FormField control={form.control} name="title" render={({ field }) => (
                    <FormItem><FormLabel>Item Title</FormLabel><FormControl><Input data-testid="input-title" placeholder="Dark blue wallet" {...field} /></FormControl><FormMessage /></FormItem>
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
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea data-testid="input-description" placeholder="Describe what you found..." {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="dateFound" render={({ field }) => (
                    <FormItem><FormLabel>Date Found</FormLabel><FormControl><Input data-testid="input-date-found" type="date" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="foundLocation" render={({ field }) => (
                    <FormItem><FormLabel>Found Location</FormLabel><FormControl><Input data-testid="input-location" placeholder="CSE Building entrance" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <FormField control={form.control} name="finderContact" render={({ field }) => (
                    <FormItem><FormLabel>Your Contact</FormLabel><FormControl><Input data-testid="input-contact" placeholder="Phone or email" {...field} /></FormControl><FormMessage /></FormItem>
                  )} />
                  <Button data-testid="button-submit" type="submit" className="w-full" disabled={createMutation.isPending}>
                    {createMutation.isPending ? "Submitting..." : "Submit Report"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Claim Dialog */}
        <Dialog open={claimItemId !== null} onOpenChange={(o) => !o && setClaimItemId(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader><DialogTitle>Submit a Claim</DialogTitle></DialogHeader>
            <p className="text-sm text-muted-foreground mb-3">Provide proof that this item belongs to you. Admins will review your claim.</p>
            <Form {...claimForm}>
              <form onSubmit={claimForm.handleSubmit(onClaim)} className="space-y-3">
                <FormField control={claimForm.control} name="proofText" render={({ field }) => (
                  <FormItem><FormLabel>Proof of Ownership</FormLabel>
                    <FormControl><Textarea data-testid="input-proof" placeholder="Describe unique features, contents, or circumstances that prove this is yours..." rows={4} {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button data-testid="button-submit-claim" type="submit" className="w-full" disabled={claimMutation.isPending}>
                  {claimMutation.isPending ? "Submitting..." : "Submit Claim"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">No found items reported yet.</div>
        ) : (
          <div className="space-y-4">
            {data?.items?.map((item) => (
              <div key={item.id} data-testid={`card-found-${item.id}`} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[item.status] ?? ""}`}>{item.status}</span>
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{item.category}</span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">{item.description}</p>
                    <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                      <span>{item.foundLocation ?? "Location unknown"}</span>
                      <span>&bull; Found {formatDate(item.dateFound)}</span>
                    </div>
                  </div>
                  {item.status === "Found" && (
                    <Button
                      data-testid={`button-claim-${item.id}`}
                      size="sm"
                      variant="outline"
                      onClick={() => setClaimItemId(item.id)}
                      className="flex-shrink-0"
                    >
                      This is Mine
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
