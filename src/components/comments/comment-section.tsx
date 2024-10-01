import { getCommentsWithReplies } from "@/server/queries/comments";
import CommentList from "./comment-list";

const CommentSection = async ({ postId }: { postId: number }) => {
  const commentsWithReplies = await getCommentsWithReplies(postId);
  return <CommentList comments={commentsWithReplies} />;
};

export default CommentSection;
