"use client";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import {
  downvoteComment,
  downvotePost,
  upvoteComment,
  upvotePost,
} from "@/server/queries/votes";
import { useAuth } from "@clerk/nextjs";

type Props = {
  upvotes: number;
  id: number;
  userVote?: number;
  schema?: "comment" | "post";
};

const Upvotes = ({ upvotes, userVote, schema, id }: Props) => {
  const user = useAuth();

  const onUpvote = async () => {
    if (!user?.userId) {
      return;
    }
    const mutation = schema === "comment" ? upvoteComment : upvotePost;
    await mutation(user?.userId, id);
  };

  const onDownvote = async () => {
    if (!user?.userId) {
      return;
    }
    const mutation = schema === "comment" ? downvoteComment : downvotePost;
    await mutation(user?.userId, id);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <Button variant="ghost" size="icon" onClick={onUpvote}>
        <ArrowBigUp
          className={cn("h-6 w-6", { "text-reddit": userVote === 1 })}
          fill={userVote === 1 ? "#D93900" : "currentColor"}
        />
      </Button>
      <span className="font-bold">{upvotes}</span>
      <Button variant="ghost" size="icon" onClick={onDownvote}>
        <ArrowBigDown
          className={cn("h-6 w-6", { "text-reddit": userVote === -1 })}
          fill={userVote === -1 ? "#D93900" : "currentColor"}
        />
      </Button>
    </div>
  );
};

export default Upvotes;
