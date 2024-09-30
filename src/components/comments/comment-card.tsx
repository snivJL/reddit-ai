import { clerkClient, currentUser } from "@clerk/nextjs/server";
import Upvotes from "../upvotes";
import { getExistingVote } from "@/server/queries/votes";
import CommentToolbar from "./comment-toolbar";
import { CommentWithReplies } from "@/server/db/schema";

type Props = {
  comment: CommentWithReplies;
};

const CommentCard = async ({ comment }: Props) => {
  const [author, user] = await Promise.all([
    clerkClient.users.getUser(comment.authorId),
    currentUser(),
  ]);

  const vote = await getExistingVote(user?.id ?? "", comment.id, "comment");

  return (
    <div className="flex space-x-3 rounded-lg p-4 text-sm shadow-sm">
      <Upvotes
        upvotes={comment.upvotes ?? 0}
        id={comment.id}
        schema="comment"
        userVote={vote?.value}
      />
      <div className="flex-grow">
        <div className="mb-1 flex items-center space-x-2">
          <div className="h-6 w-6 flex-shrink-0 rounded-full bg-gray-300"></div>
          <span className="text-sm font-semibold">{author.username}</span>
          <span className="text-xs">
            {new Date(comment.createdAt ?? "")
              .toLocaleString()
              .toLocaleString()}
          </span>
        </div>
        <p className="mb-2">{comment.content}</p>
        <CommentToolbar comment={comment} />
        {comment.replies?.map((reply) => (
          <CommentCard key={reply.id} comment={reply} />
        ))}
      </div>
    </div>
  );
};

export default CommentCard;
