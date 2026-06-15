import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { foundItemsTable, usersTable } from "@workspace/db";
import { eq, ilike, and, or } from "drizzle-orm";
import { requireAuth, type AuthRequest } from "../middlewares/auth";
import {
  CreateFoundItemBody,
  UpdateFoundItemBody,
  GetFoundItemParams,
  UpdateFoundItemParams,
  DeleteFoundItemParams,
  ListFoundItemsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

function formatItem(item: typeof foundItemsTable.$inferSelect, founderName?: string | null) {
  return {
    id: item.id,
    title: item.title,
    category: item.category,
    description: item.description,
    image: item.image,
    dateFound: item.dateFound,
    foundLocation: item.foundLocation,
    status: item.status,
    foundBy: item.foundBy,
    founderName: founderName ?? null,
    finderContact: item.finderContact,
    createdAt: item.createdAt.toISOString(),
  };
}

router.get("/found-items", async (req, res): Promise<void> => {
  const query = ListFoundItemsQueryParams.safeParse(req.query);
  const { search, category, status, location } = query.success ? query.data : {};

  const conditions = [];
  if (search) conditions.push(or(ilike(foundItemsTable.title, `%${search}%`), ilike(foundItemsTable.description, `%${search}%`)));
  if (category) conditions.push(eq(foundItemsTable.category, category));
  if (status) conditions.push(eq(foundItemsTable.status, status));
  if (location) conditions.push(ilike(foundItemsTable.foundLocation, `%${location}%`));

  const items = conditions.length > 0
    ? await db.select().from(foundItemsTable).where(and(...conditions)).orderBy(foundItemsTable.createdAt)
    : await db.select().from(foundItemsTable).orderBy(foundItemsTable.createdAt);

  const userIds = [...new Set(items.map(i => i.foundBy))];
  const users = userIds.length > 0
    ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable)
    : [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));

  res.json({ items: items.map(i => formatItem(i, userMap[i.foundBy])), total: items.length });
});

router.post("/found-items", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateFoundItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [item] = await db.insert(foundItemsTable).values({
    ...parsed.data,
    foundBy: req.user!.id,
  }).returning();
  res.status(201).json(formatItem(item));
});

router.get("/found-items/:id", async (req, res): Promise<void> => {
  const params = GetFoundItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [item] = await db.select().from(foundItemsTable).where(eq(foundItemsTable.id, params.data.id));
  if (!item) {
    res.status(404).json({ error: "Found item not found" });
    return;
  }
  const [founder] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, item.foundBy));
  res.json(formatItem(item, founder?.name));
});

router.put("/found-items/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = UpdateFoundItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateFoundItemBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [existing] = await db.select().from(foundItemsTable).where(eq(foundItemsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Found item not found" });
    return;
  }
  if (existing.foundBy !== req.user!.id && req.user!.role !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [updated] = await db.update(foundItemsTable).set(parsed.data).where(eq(foundItemsTable.id, params.data.id)).returning();
  res.json(formatItem(updated));
});

router.delete("/found-items/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = DeleteFoundItemParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [existing] = await db.select().from(foundItemsTable).where(eq(foundItemsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Found item not found" });
    return;
  }
  if (existing.foundBy !== req.user!.id && req.user!.role !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  await db.delete(foundItemsTable).where(eq(foundItemsTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
