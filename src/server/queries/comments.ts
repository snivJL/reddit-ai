"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";
import { comments, CommentWithReplies } from "../db/schema";
import { desc, eq } from "drizzle-orm";

export async function addComment(
  postId: number,
  content: string,
  authorId: string,
) {
  try {
    const [newComment] = await db
      .insert(comments)
      .values({
        content,
        postId,
        authorId,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newComment) {
      throw new Error("Failed to add comment");
    }

    revalidatePath(`/post/${postId}`);

    return { success: true, comment: newComment, error: null };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, comment: null, error: "Failed to add comment" };
  }
}

export async function getCommentsWithReplies(postId: number) {
  const allComments = await db
    .select({
      id: comments.id,
      content: comments.content,
      upvotes: comments.upvotes,
      parentCommentId: comments.parentCommentId,
      authorId: comments.authorId,
      postId: comments.postId,
      createdAt: comments.createdAt,
      updatedAt: comments.updatedAt,
    })
    .from(comments)
    .where(eq(comments.postId, postId))
    .orderBy(desc(comments.upvotes));

  function buildCommentTree(parentId: number | null): CommentWithReplies[] {
    return allComments
      .filter((c) => c.parentCommentId === parentId)
      .map((c) => ({
        ...c,
        replies: buildCommentTree(c.id),
      }));
  }

  const commentTree = buildCommentTree(null);

  return commentTree;
}

export async function addCommentReply(commentId: number, content: string) {
  try {
    const [parentComment] = await db
      .select({
        id: comments.id,
        postId: comments.postId,
        authorId: comments.authorId,
      })
      .from(comments)
      .where(eq(comments.id, commentId))
      .limit(1);

    if (!parentComment) {
      throw new Error("Failed to add comment");
    }
    const [newComment] = await db
      .insert(comments)
      .values({
        content,
        postId: parentComment.postId,
        authorId: parentComment.authorId,
        parentCommentId: parentComment.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newComment) {
      throw new Error("Failed to add comment");
    }

    revalidatePath(`/post/${parentComment.postId}}`);

    return { success: true, comment: newComment, error: null };
  } catch (error) {
    console.error("Error adding comment:", error);
    return { success: false, comment: null, error: "Failed to add comment" };
  }
}
