import { Router, type IRouter } from "express";
import { db } from "@workspace/db";
import { lostItemsTable, foundItemsTable, claimsTable, usersTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const router: IRouter = Router();

router.get("/analytics/dashboard", async (_req, res): Promise<void> => {
  const [lostCount] = await db.select({ count: sql<number>`count(*)::int` }).from(lostItemsTable);
  const [foundCount] = await db.select({ count: sql<number>`count(*)::int` }).from(foundItemsTable);
  const [claimsCount] = await db.select({ count: sql<number>`count(*)::int` }).from(claimsTable);
  const [usersCount] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable);
  const [recoveredCount] = await db.select({ count: sql<number>`count(*)::int` }).from(lostItemsTable).where(eq(lostItemsTable.status, "Recovered"));
  const [pendingCount] = await db.select({ count: sql<number>`count(*)::int` }).from(claimsTable).where(eq(claimsTable.status, "Pending"));

  const totalLost = lostCount?.count ?? 0;
  const recovered = recoveredCount?.count ?? 0;
  const recoveryRate = totalLost > 0 ? Math.round((recovered / totalLost) * 100) : 0;

  // Category stats from lost items
  const catStats = await db
    .select({ category: lostItemsTable.category, count: sql<number>`count(*)::int` })
    .from(lostItemsTable)
    .groupBy(lostItemsTable.category)
    .orderBy(sql`count(*) desc`);

  // Monthly stats (last 6 months)
  const monthlyLost = await db.execute(sql`
    SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
           DATE_TRUNC('month', created_at) as month_date,
           count(*)::int as count
    FROM lost_items
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY month, month_date
    ORDER BY month_date
  `);

  const monthlyFound = await db.execute(sql`
    SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
           DATE_TRUNC('month', created_at) as month_date,
           count(*)::int as count
    FROM found_items
    WHERE created_at >= NOW() - INTERVAL '6 months'
    GROUP BY month, month_date
    ORDER BY month_date
  `);

  const monthlyRecovered = await db.execute(sql`
    SELECT TO_CHAR(created_at, 'Mon YYYY') as month,
           DATE_TRUNC('month', created_at) as month_date,
           count(*)::int as count
    FROM lost_items
    WHERE status = 'Recovered' AND created_at >= NOW() - INTERVAL '6 months'
    GROUP BY month, month_date
    ORDER BY month_date
  `);

  // Build monthly stats map
  const monthMap: Record<string, { lost: number; found: number; recovered: number }> = {};
  for (const row of monthlyLost.rows as Array<{ month: string; count: number }>) {
    if (!monthMap[row.month]) monthMap[row.month] = { lost: 0, found: 0, recovered: 0 };
    monthMap[row.month].lost = row.count;
  }
  for (const row of monthlyFound.rows as Array<{ month: string; count: number }>) {
    if (!monthMap[row.month]) monthMap[row.month] = { lost: 0, found: 0, recovered: 0 };
    monthMap[row.month].found = row.count;
  }
  for (const row of monthlyRecovered.rows as Array<{ month: string; count: number }>) {
    if (!monthMap[row.month]) monthMap[row.month] = { lost: 0, found: 0, recovered: 0 };
    monthMap[row.month].recovered = row.count;
  }

  const monthlyStats = Object.entries(monthMap).map(([month, stats]) => ({ month, ...stats }));

  res.json({
    totalLostItems: totalLost,
    totalFoundItems: foundCount?.count ?? 0,
    totalClaims: claimsCount?.count ?? 0,
    totalUsers: usersCount?.count ?? 0,
    recoveredItems: recovered,
    recoveryRate,
    pendingClaims: pendingCount?.count ?? 0,
    categoryStats: catStats.map(c => ({ category: c.category, count: c.count })),
    monthlyStats,
  });
});

export default router;
