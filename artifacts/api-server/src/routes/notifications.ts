import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import { MarkNotificationReadParams } from "@workspace/api-zod";

const router: IRouter = Router();

function formatNotification(n: typeof notificationsTable.$inferSelect) {
  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  };
}

router.get("/notifications", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(notificationsTable.createdAt);
  const formatted = notifications.map(formatNotification);
  res.json({ items: formatted, total: formatted.length });
});

router.patch("/notifications/:id/read", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, params.data.id), eq(notificationsTable.userId, req.user!.id)))
    .returning();
  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }
  res.json(formatNotification(notification));
});

export default router;
