import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { claimsTable, usersTable, lostItemsTable, foundItemsTable, notificationsTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth, requireAdmin, type AuthRequest } from "../middlewares/auth";
import {
  CreateClaimBody,
  GetClaimParams,
  ApproveClaimParams,
  RejectClaimParams,
  MarkReturnedParams,
  ListClaimsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

async function getItemTitle(itemType: string, itemId: number): Promise<string | null> {
  if (itemType === "lost") {
    const [item] = await db.select({ title: lostItemsTable.title }).from(lostItemsTable).where(eq(lostItemsTable.id, itemId));
    return item?.title ?? null;
  } else {
    const [item] = await db.select({ title: foundItemsTable.title }).from(foundItemsTable).where(eq(foundItemsTable.id, itemId));
    return item?.title ?? null;
  }
}

function formatClaim(claim: typeof claimsTable.$inferSelect, claimantName?: string | null, itemTitle?: string | null) {
  return {
    id: claim.id,
    claimantId: claim.claimantId,
    claimantName: claimantName ?? null,
    itemType: claim.itemType,
    itemId: claim.itemId,
    itemTitle: itemTitle ?? null,
    proofText: claim.proofText,
    proofImage: claim.proofImage,
    status: claim.status,
    reviewedBy: claim.reviewedBy,
    reviewedAt: claim.reviewedAt?.toISOString() ?? null,
    createdAt: claim.createdAt.toISOString(),
  };
}

router.get("/claims", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const query = ListClaimsQueryParams.safeParse(req.query);
  const { status } = query.success ? query.data : {};

  let claims;
  if (req.user!.role === "Admin") {
    claims = status
      ? await db.select().from(claimsTable).where(eq(claimsTable.status, status)).orderBy(claimsTable.createdAt)
      : await db.select().from(claimsTable).orderBy(claimsTable.createdAt);
  } else {
    claims = status
      ? await db.select().from(claimsTable).where(and(eq(claimsTable.claimantId, req.user!.id), eq(claimsTable.status, status))).orderBy(claimsTable.createdAt)
      : await db.select().from(claimsTable).where(eq(claimsTable.claimantId, req.user!.id)).orderBy(claimsTable.createdAt);
  }

  const userIds = [...new Set(claims.map(c => c.claimantId))];
  const users = userIds.length > 0 ? await db.select({ id: usersTable.id, name: usersTable.name }).from(usersTable) : [];
  const userMap = Object.fromEntries(users.map(u => [u.id, u.name]));

  const formatted = await Promise.all(claims.map(async c => {
    const itemTitle = await getItemTitle(c.itemType, c.itemId);
    return formatClaim(c, userMap[c.claimantId], itemTitle);
  }));
  res.json({ items: formatted, total: formatted.length });
});

router.post("/claims", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const parsed = CreateClaimBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [claim] = await db.insert(claimsTable).values({
    ...parsed.data,
    claimantId: req.user!.id,
  }).returning();

  // Notify the item owner
  const itemTitle = await getItemTitle(parsed.data.itemType, parsed.data.itemId);
  await db.insert(notificationsTable).values({
    userId: req.user!.id,
    title: "Claim Submitted",
    message: `Your claim for "${itemTitle}" has been submitted and is pending review.`,
    type: "claim",
  });

  res.status(201).json(formatClaim(claim, null, itemTitle));
});

router.get("/claims/:id", requireAuth, async (req: AuthRequest, res): Promise<void> => {
  const params = GetClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [claim] = await db.select().from(claimsTable).where(eq(claimsTable.id, params.data.id));
  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  if (claim.claimantId !== req.user!.id && req.user!.role !== "Admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  const [claimant] = await db.select({ name: usersTable.name }).from(usersTable).where(eq(usersTable.id, claim.claimantId));
  const itemTitle = await getItemTitle(claim.itemType, claim.itemId);
  res.json(formatClaim(claim, claimant?.name, itemTitle));
});

router.patch("/claims/:id/approve", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = ApproveClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [claim] = await db.update(claimsTable).set({
    status: "Approved",
    reviewedBy: req.user!.id,
    reviewedAt: new Date(),
  }).where(eq(claimsTable.id, params.data.id)).returning();
  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  await db.insert(notificationsTable).values({
    userId: claim.claimantId,
    title: "Claim Approved",
    message: `Your claim has been approved! Please collect your item.`,
    type: "claim_approved",
  });
  const itemTitle = await getItemTitle(claim.itemType, claim.itemId);
  res.json(formatClaim(claim, null, itemTitle));
});

router.patch("/claims/:id/reject", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = RejectClaimParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [claim] = await db.update(claimsTable).set({
    status: "Rejected",
    reviewedBy: req.user!.id,
    reviewedAt: new Date(),
  }).where(eq(claimsTable.id, params.data.id)).returning();
  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  await db.insert(notificationsTable).values({
    userId: claim.claimantId,
    title: "Claim Rejected",
    message: `Your claim has been rejected. Please provide more proof or contact the admin.`,
    type: "claim_rejected",
  });
  const itemTitle = await getItemTitle(claim.itemType, claim.itemId);
  res.json(formatClaim(claim, null, itemTitle));
});

router.patch("/claims/:id/returned", requireAdmin, async (req: AuthRequest, res): Promise<void> => {
  const params = MarkReturnedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [claim] = await db.update(claimsTable).set({
    status: "Returned",
    reviewedBy: req.user!.id,
    reviewedAt: new Date(),
  }).where(eq(claimsTable.id, params.data.id)).returning();
  if (!claim) {
    res.status(404).json({ error: "Claim not found" });
    return;
  }
  // Update item status to Recovered/Returned
  if (claim.itemType === "lost") {
    await db.update(lostItemsTable).set({ status: "Recovered" }).where(eq(lostItemsTable.id, claim.itemId));
  } else {
    await db.update(foundItemsTable).set({ status: "Returned" }).where(eq(foundItemsTable.id, claim.itemId));
  }
  await db.insert(notificationsTable).values({
    userId: claim.claimantId,
    title: "Item Returned",
    message: `Your item has been marked as returned. Congratulations on recovering it!`,
    type: "item_returned",
  });
  const itemTitle = await getItemTitle(claim.itemType, claim.itemId);
  res.json(formatClaim(claim, null, itemTitle));
});

export default router;
