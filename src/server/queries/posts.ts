"use server";

import { desc } from "drizzle-orm";
import { posts } from "../db/schema";
import { db } from "../db";
import { uploadMedia } from "@/lib/upload-media";
import { revalidatePath } from "next/cache";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";

export async function getAllPosts() {
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
      })
      .from(posts)
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
  const user = await currentUser();

  if (!user?.id) {
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
      authorId: user.id,
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
