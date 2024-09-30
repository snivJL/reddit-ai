import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { clerkClient } from "@clerk/nextjs/server";
import type { SelectPost } from "@/server/db/schema";
// import Upvotes from "./vote";
// import { downvotePost, upvotePost } from "@/actions/votes";

type Props = {
  post: SelectPost;
};

export default async function PostCard({ post }: Props) {
  const author = await clerkClient.users.getUser(post.authorId);

  return (
    <Card>
      <CardContent className="flex items-start space-x-4 pt-6">
        {/* <Upvotes
          upvotes={post.upvotes || 0}
          onDownvote={() => downvotePost(user?.id || 0, post.id)}
          onUpvote={() => upvotePost(user?.id || 0, post.id)}
        /> */}
        <div className="flex-1">
          <Link
            href={`/post/${post?.id}`}
            className="text-lg font-semibold hover:underline"
          >
            {post?.title}
          </Link>
          <p className="text-muted-foreground text-sm">
            Posted by {author.username} •{" "}
            {new Date(post.createdAt).toLocaleString()}
          </p>
          {post.mediaUrl && (
            <Image
              src={post.mediaUrl}
              alt="post image"
              width={400}
              height={300}
            />
          )}
          <p>{post.content}</p>
        </div>
      </CardContent>
      <CardFooter>
        <Link href={`/post/${post?.id}`}>
          <Button variant="ghost" className="text-muted-foreground">
            <MessageSquare className="mr-2 h-4 w-4" />
            {post?.commentCount || 0} Comments
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
