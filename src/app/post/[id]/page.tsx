import { getPostById } from "@/server/queries/posts";

import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import Upvotes from "@/components/upvotes";
import { getExistingVote } from "@/server/queries/votes";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import CommentSection from "@/components/comments/comment-section";
import { Textarea } from "@/components/ui/textarea";

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

  return (
    <main className="mx-auto w-8/12 py-6">
      <div className="flex items-start space-x-4 pt-6">
        <Upvotes
          upvotes={post.upvotes ?? 0}
          id={post.id}
          schema="post"
          userVote={vote?.value}
        />
        <div className="flex-1">
          <Link
            href={`/post/${post.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {post.title}
          </Link>
          <p className="text-sm text-muted-foreground">
            Posted by u/{author.username} •{" "}
            {new Date(post?.createdAt ?? "").toLocaleString()}
          </p>
        </div>
      </div>
      <Button variant="ghost" className="text-muted-foreground">
        <MessageSquare className="mr-2 h-4 w-4" />
        {post?.comments.length} Comments
      </Button>
      <CommentSection postId={postId} />
      {/* <PostDetail post={post}>
        <CommentList comments={commentsWithReplies} />
      </PostDetail> */}
    </main>
  );
}
