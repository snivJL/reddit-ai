// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import {
  type InferInsertModel,
  type InferSelectModel,
  relations,
  sql,
} from "drizzle-orm";
import {
  index,
  integer,
  pgTableCreator,
  serial,
  text,
  timestamp,
  uniqueIndex,
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

export const postsRelations = relations(posts, ({ many }) => ({
  comments: many(comments),
}));

export const votes = createTable(
  "vote",
  {
    id: serial("id").primaryKey(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    postId: integer("post_id").references(() => posts.id),
    commentId: integer("comment_id").references(() => comments.id),
    value: integer("value").notNull(),
  },
  (table) => ({
    uniqueVote: uniqueIndex("unique_vote_idx").on(
      table.userId,
      table.postId,
      table.commentId,
    ),
  }),
);

export const votesRelations = relations(votes, ({ one }) => ({
  post: one(posts, {
    fields: [votes.postId],
    references: [posts.id],
  }),
  comment: one(comments, {
    fields: [votes.commentId],
    references: [comments.id],
  }),
}));

export const comments = createTable("comment", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  upvotes: integer("upvotes").default(0),
  authorId: varchar("author_id", { length: 256 }).notNull(),
  postId: integer("post_id").notNull(),
  parentCommentId: integer("parent_comment_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  parentComment: one(comments, {
    fields: [comments.parentCommentId],
    references: [comments.id],
    relationName: "parentChild",
  }),
  childComments: many(comments, {
    relationName: "parentChild",
  }),
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
}));

export type SelectPost = InferSelectModel<typeof posts>;
export type InsertPost = InferInsertModel<typeof posts>;
export type SelectComment = InferSelectModel<typeof comments>;
export type InsertComment = InferInsertModel<typeof comments>;
export type SelectVote = InferSelectModel<typeof votes>;
export type InsertVote = InferInsertModel<typeof votes>;
export type CommentWithReplies = SelectComment & {
  replies: CommentWithReplies[];
};
