import { pgTable, text, serial, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const foundItemsTable = pgTable("found_items", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category").notNull(),
  description: text("description").notNull(),
  image: text("image"),
  dateFound: text("date_found"),
  foundLocation: text("found_location"),
  status: text("status").notNull().default("Found"),
  foundBy: integer("found_by").notNull(),
  finderContact: text("finder_contact"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertFoundItemSchema = createInsertSchema(foundItemsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertFoundItem = z.infer<typeof insertFoundItemSchema>;
export type FoundItem = typeof foundItemsTable.$inferSelect;
