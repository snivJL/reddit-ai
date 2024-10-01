"use server";

import type { CommentWithReplies } from "@/server/db/schema";
import CommentCard from "./comment-card";

type Props = {
  comments: CommentWithReplies[] | null;
};

const CommentList = ({ comments }: Props) => {
  if (!comments) {
    return null;
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
};

export default CommentList;
