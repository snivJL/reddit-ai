"use server";

import type { CommentWithReplies, SelectComment } from "@/server/db/schema";
import CommentCard from "./comment-card";
import CommentAdd from "./comment-add";
import CommentToolbar from "./comment-toolbar";

type Props = {
  comments: CommentWithReplies[] | null;
};

const CommentList = ({ comments }: Props) => {
  if (!comments) {
    return null;
  }

  return (
    <>
      <CommentToolbar />
      <div className="flex flex-col gap-4">
        {comments.map((comment) => (
          <CommentCard key={comment.id} comment={comment} />
        ))}
      </div>
    </>
  );
};

export default CommentList;
