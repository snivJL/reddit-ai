import { getPostById } from "@/server/queries/posts";
import Markdown from "react-markdown";

import Link from "next/link";
import Upvotes from "@/components/upvotes";
import { getExistingVote } from "@/server/queries/votes";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import CommentSection from "@/components/comments/comment-section";
import { getRelativeTimeString } from "@/lib/dates";
import ImageBlur from "@/components/image-blur";
import CommentToolbar from "@/components/comments/comment-toolbar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function PostCard({ params }: { params: { id: string } }) {
  const postId = Number(params.id);
  if (Number.isNaN(postId)) {
    throw new Error("Invalid post ID");
  }
  const post = await getPostById(postId);

  if (!post) {
    throw new Error("Post not found");
  }

  const [author, user] = await Promise.all([
    clerkClient.users.getUser(post.authorId),
    currentUser(),
  ]);

  const vote = await getExistingVote(user?.id ?? "", post.id, "post");

  const createDateString = getRelativeTimeString(post.createdAt ?? new Date());
  return (
    <main className="mx-auto w-8/12 py-6">
      <div className="relative flex items-start pt-6">
        <Link href={"/"}>
          <Button
            variant="secondary"
            className="absolute -left-12 top-6 rounded-full"
            size="icon"
          >
            <ArrowLeft className="size-5" />
          </Button>
        </Link>
        <div>
          <span className="text-lg font-semibold">{post.title}</span>
          <p className="text-sm text-muted-foreground">
            Posted by u/{author.username} • {createDateString}
          </p>
        </div>
      </div>
      {post.mediaUrl && <ImageBlur url={post.mediaUrl} alt={post.title} />}
      <Markdown className="py-2 text-sm">{post.content}</Markdown>
      <CommentToolbar>
        <Upvotes
          upvotes={post.upvotes ?? 0}
          id={post.id}
          schema="post"
          userVote={vote?.value}
        />
      </CommentToolbar>
      <CommentSection postId={postId} />
    </main>
  );
}
