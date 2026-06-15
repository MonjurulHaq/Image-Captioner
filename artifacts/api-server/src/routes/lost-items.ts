import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { lostItemsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import {
  CreateLostItemBody,
  UpdateLostItemBody,
  GetLostItemParams,
  UpdateLostItemParams,
  DeleteLostItemParams,
  ListLostItemsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatItem(item: typeof lostItemsTable.$inferSelect, reporterName?: string | null) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    image: item.image,
    dateLost: item.dateLost,
    lastSeenLocation: item.lastSeenLocation,
    status: item.status,
    reportedBy: item.reportedBy,
    reporterName: reporterName ?? null,
    aiMatches: item.aiMatches,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/lost-items", async (req, res): Promise<void> => {
  const query = ListLostItemsQueryParams.safeParse(req.query);
  const { search, category, status, location } = query.success ? query.data : {};

  const conditions = [];
  if (search) conditions.push(or(ilike(lostItemsTable.title, `%${search}%`), ilike(lostItemsTable.description, `%${search}%`)));
  if (category) conditions.push(eq(lostItemsTable.category, category));
  if (status) conditions.push(eq(lostItemsTable.status, status));
  if (location) conditions.push(ilike(lostItemsTable.lastSeenLocation, `%${location}%`));

  const items = conditions.length > 0
    ? await db.select().from(lostItemsTable).where(and(...conditions)).orderBy(lostItemsTable.createdAt)
    : await db.select().from(lostItemsTable).orderBy(lostItemsTable.createdAt);

  const userIds = [...new Set(items.map(i => i.reportedBy))];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable)
    : [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));

  res.json({ items: items.map(i => formatItem(i, userMap[i.reportedBy])), total: items.length });
});

router.post("/lost-items", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateLostItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(lostItemsTable).values({
    ...parsed.data,
    reportedBy: req.user!.id,
  }).returning();
  res.status(201).json(formatItem(item));
});

router.get("/lost-items/:id", async (req, res): Promise<void> => {
  const params = GetLostItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.select().from(lostItemsTable).where(eq(lostItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Lost item not found" });
    return;
  }
  const [reporter] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, item.reportedBy));
  res.json(formatItem(item, reporter?.name));
});

router.put("/lost-items/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateLostItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateLostItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(lostItemsTable).where(eq(lostItemsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Lost item not found" });
    return;
  }
  if (existing.reportedBy !== req.user!.id && req.user!.role !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [updated] = await db.update(lostItemsTable).set(parsed.data).where(eq(lostItemsTable.id, params.data.id)).returning();
  res.json(formatItem(updated));
});

router.delete("/lost-items/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteLostItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db.select().from(lostItemsTable).where(eq(lostItemsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Lost item not found" });
    return;
  }
  if (existing.reportedBy !== req.user!.id && req.user!.role !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(lostItemsTable).where(eq(lostItemsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
