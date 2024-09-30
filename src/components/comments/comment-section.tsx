import { getCommentsWithReplies } from "@/server/queries/comments";
import CommentList from "./comment-list";

const CommentSection = async ({ postId }: { postId: number }) => {
  const commentsWithReplies = await getCommentsWithReplies(postId);
  return (
    <div>
      <CommentList comments={commentsWithReplies} />{" "}
    </div>
  );
};

export default CommentSection;
