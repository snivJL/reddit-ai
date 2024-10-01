"use client";

import { type FormEvent, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { revalidatePath } from "next/cache";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { addComment, addCommentReply } from "@/server/queries/comments";
import { isEmptyOrWhitespace } from "@/lib/form";

type Props = {
  parentId?: number;
  onSuccess?: () => void;
};
const CommentAdd = ({ parentId, onSuccess }: Props) => {
  const [commentContent, setCommentContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = useAuth();
  const { id } = useParams();

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (!id || !user?.userId) {
      throw new Error("Failed to add comment: missing information");
    }
    try {
      await (parentId
        ? addCommentReply(parentId, commentContent)
        : addComment(Number(id), commentContent, user.userId));
      setCommentContent("");
      onSuccess?.();
      revalidatePath(`/post/${id as string}`);
    } catch (error) {
      console.error("Failed to add comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Card className="mt-4 pt-6">
        <CardContent>
          <form onSubmit={handleCommentSubmit} className="space-y-4">
            <Textarea
              className="w-full border-none"
              placeholder="What are your thoughts?"
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
            />
            <Button
              type="submit"
              disabled={isSubmitting || isEmptyOrWhitespace(commentContent)}
            >
              {isSubmitting ? "Submitting..." : "Comment"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </>
  );
};

export default CommentAdd;
