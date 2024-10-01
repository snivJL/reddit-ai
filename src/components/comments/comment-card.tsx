import { clerkClient, currentUser } from "@clerk/nextjs/server";
import Upvotes from "../upvotes";
import { getExistingVote } from "@/server/queries/votes";
import CommentToolbar from "./comment-toolbar";
import type { CommentWithReplies } from "@/server/db/schema";
import { cn } from "@/lib/utils";
import { getRelativeTimeString } from "@/lib/dates";
import UserAvatar from "../user-avatar";

type Props = {
  comment: CommentWithReplies;
  isReply?: boolean;
  depth?: number;
};

const CommentCard = async ({ comment, isReply, depth = 0 }: Props) => {
  const [author, user] = await Promise.all([
    clerkClient.users.getUser(comment.authorId),
    currentUser(),
  ]);

  const vote = await getExistingVote(user?.id ?? "", comment.id, "comment");

  const createDateString = getRelativeTimeString(
    comment.createdAt ?? new Date(),
  );

  return (
    <div className={cn("mb-4", { "ml-4": depth > 0 })}>
      <div
        className={cn("flex space-x-3 rounded-lg p-4 text-sm shadow-sm", {
          "border-l-2 border-gray-200": depth > 0,
        })}
      >
        <div className="flex-grow">
          <div className="mb-1 flex items-center space-x-2">
            <UserAvatar />
            <span className="text-sm font-semibold">{`u/${author.username}`}</span>
            <span className="text-xs">{createDateString}</span>
          </div>
          <p className="my-2">{comment.content}</p>

          <CommentToolbar comment={comment}>
            <Upvotes
              upvotes={comment.upvotes ?? 0}
              id={comment.id}
              schema="comment"
              userVote={vote?.value}
            />
          </CommentToolbar>
        </div>
      </div>

      {comment.replies?.map((reply) => (
        <CommentCard key={reply.id} comment={reply} isReply depth={depth + 1} />
      ))}
    </div>
  );
};

export default CommentCard;
