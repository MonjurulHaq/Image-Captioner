import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const lostItemsTable = pgTable("lost_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  dateLost: text("date_lost"),
  lastSeenLocation: text("last_seen_location"),
  status: text("status").notNull().default("Lost"),
  reportedBy: integer("reported_by").notNull(),
  aiMatches: text("ai_matches"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertLostItemSchema = createInsertSchema(lostItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertLostItem = z.infer<typeof insertLostItemSchema>;
export type LostItem = typeof lostItemsTable.$inferSelect;
