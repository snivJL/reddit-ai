import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { SelectPost } from "@/server/db/schema";
import Upvotes from "../upvotes";
import { getExistingVote } from "@/server/queries/votes";
import { getRelativeTimeString } from "@/lib/dates";
import UserAvatar from "../user-avatar";
import ImageBlur from "../image-blur";
import Markdown from "react-markdown";
import { PostActionsDropdown } from "./post-actions-dropdown";

type Props = {
  post: SelectPost & { commentCount: number };
};

export default async function PostCard({ post }: Props) {
  const [author, user] = await Promise.all([
    clerkClient.users.getUser(post.authorId),
    currentUser(),
  ]);

  const vote = await getExistingVote(user?.id ?? "", post.id, "post");

  const createDateString = getRelativeTimeString(post.createdAt ?? new Date());

  return (
    <Link href={`/post/${post?.id}`}>
      <Card className="hover:bg-accent/50 hover:text-accent-foreground">
        <CardContent className="flex items-start space-x-4 p-4 pt-4">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <UserAvatar />
              <p className="text-sm text-muted-foreground">
                {`Posted by ${author.username}• ${createDateString}`}
              </p>
            </div>
            <h2 className="pb-2 text-lg font-semibold">{post.title}</h2>
            {post.mediaUrl ? (
              <ImageBlur url={post.mediaUrl} alt={post.title} />
            ) : (
              <Markdown className="text-sm">{post.content}</Markdown>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4">
          <Upvotes
            upvotes={post.upvotes ?? 0}
            id={post.id}
            schema="post"
            userVote={vote?.value}
          />
          <Button variant="ghost" className="text-muted-foreground">
            <MessageSquare className="mr-2 h-4 w-4" />
            {post.commentCount || 0} Comments
          </Button>
          {author.id === user?.id ? <PostActionsDropdown post={post} /> : null}
        </CardFooter>
      </Card>
    </Link>
  );
}
