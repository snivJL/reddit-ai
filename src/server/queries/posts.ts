"use server";

import { count, desc, eq, ilike } from "drizzle-orm";
import { comments, type InsertPost, posts } from "../db/schema";
import { db } from "../db";
import { uploadMedia } from "@/lib/upload-media";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { bots, generateBotPost } from "@/lib/bots";

export async function getAllPosts(searchTerm?: string) {
  try {
    const allPosts = await db
      .select({
        id: posts.id,
        title: posts.title,
        upvotes: posts.upvotes,
        authorId: posts.authorId,
        content: posts.content,
        mediaType: posts.mediaType,
        mediaUrl: posts.mediaUrl,
        createdAt: posts.createdAt,
        updatedAt: posts.updatedAt,
        commentCount: count(comments.id),
      })
      .from(posts)
      .leftJoin(comments, () => eq(posts.id, comments.postId))
      .where(searchTerm ? ilike(posts.title, `%${searchTerm}%`) : undefined)
      .groupBy(posts.id)
      .orderBy(desc(posts.upvotes));

    return allPosts;
  } catch (error) {
    console.error("Error fetching posts:", error);
    return null;
  }
}

const PostSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  media: z.instanceof(File).optional(),
});

export type PostFormData = z.infer<typeof PostSchema>;

type ActionState = {
  errors?: {
    title?: string[];
    content?: string[];
    media?: string[];
  } | null;
  message: string;
};

export async function createPost(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const { userId } = auth();

  if (!userId) {
    return {
      errors: { title: ["Authentication required"] },
      message: "You must be logged in to create a post",
    };
  }

  const validatedFields = PostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    media: formData.get("media"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your inputs",
    };
  }

  const { title, content, media } = validatedFields.data;

  let mediaUrl = null;
  let mediaType = null;

  if (media && media.size > 0) {
    try {
      mediaUrl = await uploadMedia(media);
      mediaType = media.type.startsWith("image/") ? "image" : "video";
    } catch (error) {
      console.error("Error uploading media:", error);
      return {
        errors: { media: ["Failed to upload media"] },
        message: "Failed to upload media",
      };
    }
  }

  try {
    await db.insert(posts).values({
      title,
      content,
      mediaUrl,
      mediaType,
      authorId: userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    revalidatePath("/");
    return { errors: null, message: "Post created successfully" };
  } catch (error) {
    console.error("Error creating post:", error);
    return {
      errors: { title: ["Failed to create post"] },
      message: "Failed to create post",
    };
  }
}

export async function getPostById(id: number) {
  try {
    const [postResult] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!postResult) {
      return null;
    }

    const result = await db
      .select({
        comments,
      })
      .from(comments)
      .where(eq(comments.postId, id));

    return {
      ...postResult,
      comments: result.map((c) => ({
        ...c.comments,
      })),
    };
  } catch (error) {
    console.error(`Error fetching post with id ${id}:`, error);
    return null;
  }
}

export async function deletePost(id: number) {
  try {
    await db.delete(posts).where(eq(posts.id, id));
    revalidatePath("/");
  } catch (error) {
    console.error(`Error deleting post with id ${id}:`, error);
  }
}

export async function editPost(
  prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const postId = formData.get("id");
  if (!postId || typeof postId !== "string") {
    return {
      errors: {},
      message: "Can't retrieve post id",
    };
  }

  const validatedFields = PostSchema.safeParse({
    title: formData.get("title"),
    content: formData.get("content"),
    media: formData.get("media"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your inputs",
    };
  }

  const { title, content, media } = validatedFields.data;

  try {
    const updateData: Partial<InsertPost> = { title, content };

    let mediaUrl = null;
    let mediaType = null;

    if (media && media.size > 0) {
      try {
        mediaUrl = await uploadMedia(media);
        mediaType = media.type.startsWith("image/") ? "image" : "video";
      } catch (error) {
        console.error("Error uploading media:", error);
        return {
          errors: { media: ["Failed to upload media"] },
          message: "Failed to upload media",
        };
      }
    }

    await db
      .update(posts)
      .set({ ...updateData, mediaUrl, mediaType })
      .where(eq(posts.id, parseInt(postId, 10)));

    revalidatePath("/");
    return { errors: null, message: "Post updated successfully" };
  } catch (error) {
    console.error(`Error editing post with id ${postId}:`, error);
    return {
      errors: null,
      message: "An error occurred while updating the post",
    };
  }
}

export async function createBotPost() {
  const bot = bots[Math.floor(Math.random() * bots.length)];
  if (!bot) {
    return;
  }
  const res = await generateBotPost(bot);
  const { title, content, mediaUrl } = res;

  await db.insert(posts).values({
    title,
    content,
    authorId: bot.userId,
    ...(mediaUrl && { mediaUrl }),
    createdAt: new Date(),
  });

  revalidatePath("/");
}
