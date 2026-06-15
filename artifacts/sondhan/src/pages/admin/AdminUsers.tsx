import AppShell from "@/components/layout/AppShell";
import { useListUsers, useDeleteUser, getListUsersQueryKey } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

export default function AdminUsers() {
  const { user: currentUser } = useAuth();
  const { data, isLoading } = useListUsers({ limit: 100 });
  const deleteMutation = useDeleteUser();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleDelete = (id: number, name: string) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "User deleted" });
        queryClient.invalidateQueries({ queryKey: getListUsersQueryKey() });
      },
      onError: (err: any) => {
        toast({ title: "Error", description: err?.data?.error ?? "Failed to delete", variant: "destructive" });
      },
    });
  };

  const ROLE_COLORS: Record<string, string> = {
    Admin: "bg-primary/10 text-primary border-primary/20",
    Student: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Teacher: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    Staff: "bg-muted text-muted-foreground border-border",
  };

  return (
    <AppShell>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">User Management</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{data?.total ?? 0} users registered</p>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : (
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">University ID</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {data?.items?.map((u) => (
                  <tr key={u.id} data-testid={`row-user-${u.id}`} className="hover:bg-muted/10 transition-colors">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.email}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-muted-foreground">{u.universityId ?? "—"}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${ROLE_COLORS[u.role] ?? "bg-muted text-muted-foreground border-border"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt)}</td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser?.id && (
                        <Button
                          data-testid={`button-delete-user-${u.id}`}
                          size="sm"
                          variant="outline"
                          className="text-xs border-red-500/30 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleDelete(u.id, u.name)}
                          disabled={deleteMutation.isPending}
                        >
                          Delete
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
