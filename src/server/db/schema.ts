// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { type InferInsertModel, type InferSelectModel, sql } from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `reddit-ai_${name}`);

export const posts = createTable(
  "post",
  {
    id: serial("id").primaryKey(),
    title: varchar("name", { length: 256 }).notNull(),
    content: text("content").notNull(),
    authorId: varchar("author_id", { length: 256 }).notNull(),
    upvotes: integer("upvotes").default(0),
    mediaUrl: varchar("media_url", { length: 512 }),
    mediaType: varchar("media_type", { length: 10 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    nameIndex: index("name_idx").on(table.title),
  }),
);

export type SelectPost = InferSelectModel<typeof posts>;
export type InsertPost = InferInsertModel<typeof posts>;
