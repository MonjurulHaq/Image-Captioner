import AppShell from "@/components/layout/AppShell";
import { useListClaims } from "@workspace/api-client-react";
import { formatDate, STATUS_COLORS } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function Claims() {
  const { data, isLoading } = useListClaims({ limit: 50 });

  return (
    <AppShell>
      <div className="p-6 max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">My Claims</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track the status of your submitted claims</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground mb-2">No claims submitted yet</p>
            <p className="text-sm text-muted-foreground">Find a found item and click "This is Mine" to submit a claim.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.items?.map((claim) => (
              <div key={claim.id} data-testid={`card-claim-${claim.id}`} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full capitalize">{claim.itemType} item</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_COLORS[claim.status] ?? ""}`}>{claim.status}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{claim.proofText}</p>
                    <p className="text-xs text-muted-foreground mt-2">Submitted {formatDate(claim.createdAt)}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs text-muted-foreground">Claim #{claim.id}</p>
                    {claim.reviewedAt && (
                      <p className="text-xs text-muted-foreground mt-1">Resolved {formatDate(claim.reviewedAt)}</p>
                    )}
                  </div>
                </div>
                {claim.adminNotes && (
                  <div className="mt-3 border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Admin Notes</p>
                    <p className="text-sm">{claim.adminNotes}</p>
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
