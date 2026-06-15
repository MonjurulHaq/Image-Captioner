import AppShell from "@/components/layout/AppShell";
import { useListNotifications, useMarkNotificationRead, getListNotificationsQueryKey } from "@workspace/api-client-react";
import { formatDate } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const TYPE_STYLES: Record<string, string> = {
  info: "border-l-blue-400",
  ai_match: "border-l-amber-400",
  claim: "border-l-primary",
  system: "border-l-muted-foreground",
};

export default function Notifications() {
  const { data, isLoading } = useListNotifications({ limit: 50 });
  const markReadMutation = useMarkNotificationRead();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleMarkRead = (id: number) => {
    markReadMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      },
      onError: () => {
        toast({ title: "Error", description: "Could not mark as read", variant: "destructive" });
      },
    });
  };

  const unreadCount = data?.items?.filter((n) => !n.isRead).length ?? 0;

  return (
    <AppShell>
      <div className="p-6 max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-xl" />)}</div>
        ) : data?.items?.length === 0 ? (
          <div className="text-center py-16 bg-card border border-border rounded-xl">
            <p className="text-muted-foreground">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.items?.map((n) => (
              <div
                key={n.id}
                data-testid={`notif-${n.id}`}
                className={`bg-card border border-border border-l-4 rounded-xl px-4 py-3 transition-opacity ${TYPE_STYLES[n.type] ?? "border-l-muted"} ${n.isRead ? "opacity-60" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${!n.isRead ? "text-foreground" : "text-muted-foreground"}`}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">{formatDate(n.createdAt)}</p>
                  </div>
                  {!n.isRead && (
                    <button
                      data-testid={`button-mark-read-${n.id}`}
                      onClick={() => handleMarkRead(n.id)}
                      disabled={markReadMutation.isPending}
                      className="text-xs text-primary hover:underline flex-shrink-0"
                    >
                      Mark read
                    </button>
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
