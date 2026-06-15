import AppShell from "@/components/layout/AppShell";
import { useListClaims, useApproveClaim, useRejectClaim, useMarkReturned, getListClaimsQueryKey } from "@workspace/api-client-react";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function AdminClaims() {
  const { data, isLoading } = useListClaims({ limit: 100 });
  const approveMutation = useApproveClaim();
  const rejectMutation = useRejectClaim();
  const returnMutation = useMarkReturned();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const invalidate = () => queryClient.invalidateQueries({ queryKey: getListClaimsQueryKey() });

  const handleApprove = (id: number) => {
    approveMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: "Claim approved" }); invalidate(); },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const handleReject = (id: number) => {
    rejectMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: "Claim rejected" }); invalidate(); },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const handleReturn = (id: number) => {
    returnMutation.mutate({ id }, {
      onSuccess: () => { toast({ title: "Marked as returned" }); invalidate(); },
      onError: (err: any) => toast({ title: "Error", description: err?.data?.error, variant: "destructive" }),
    });
  };

  const pending = data?.items?.filter((c) => c.status === "Pending") ?? [];
  const others = data?.items?.filter((c) => c.status !== "Pending") ?? [];

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Claims Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {pending.length} pending review &bull; {data?.total ?? 0} total
          </p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}</div>
        ) : (
          <>
            {pending.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-3">Pending Review ({pending.length})</h2>
                <div className="space-y-3">
                  {pending.map((claim) => (
                    <div key={claim.id} data-testid={`claim-${claim.id}`} className="bg-card border border-amber-500/20 rounded-xl p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Claim #{claim.id}</span>
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{claim.itemType} item #{claim.itemId}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[claim.status] ?? ""}`}>{claim.status}</span>
                          </div>
                          <p className="text-sm mt-1">{claim.proofText}</p>
                          <p className="text-xs text-muted-foreground mt-1">Claimant ID: {claim.claimantId} &bull; Submitted {formatDate(claim.createdAt)}</p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          <Button
                            data-testid={`button-approve-${claim.id}`}
                            size="sm"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => handleApprove(claim.id)}
                            disabled={approveMutation.isPending}
                          >
                            Approve
                          </Button>
                          <Button
                            data-testid={`button-reject-${claim.id}`}
                            size="sm"
                            variant="outline"
                            className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                            onClick={() => handleReject(claim.id)}
                            disabled={rejectMutation.isPending}
                          >
                            Reject
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {others.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Resolved Claims ({others.length})</h2>
                <div className="space-y-3">
                  {others.map((claim) => (
                    <div key={claim.id} data-testid={`claim-${claim.id}`} className="bg-card border border-border rounded-xl p-4 opacity-80">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">Claim #{claim.id}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[claim.status] ?? ""}`}>{claim.status}</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2">{claim.proofText}</p>
                          <p className="text-xs text-muted-foreground mt-1">Resolved {formatDate(claim.reviewedAt)}</p>
                        </div>
                        {claim.status === "Approved" && (
                          <Button
                            data-testid={`button-return-${claim.id}`}
                            size="sm"
                            variant="outline"
                            onClick={() => handleReturn(claim.id)}
                            disabled={returnMutation.isPending}
                          >
                            Mark Returned
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(data?.items?.length ?? 0) === 0 && (
              <div className="text-center py-16 text-muted-foreground">No claims yet.</div>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
