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
import { useState, type MouseEvent } from "react";

type Props = {
  upvotes: number;
  id: number;
  userVote?: number;
  schema?: "comment" | "post";
};

const Upvotes = ({ upvotes, userVote, schema, id }: Props) => {
  const user = useAuth();
  const [upvoteState, setUpvoteState] = useState({ upvotes, userVote });

  const onUpvote = async (e: MouseEvent) => {
    e.preventDefault();
    setUpvoteState((prevState) => ({
      ...prevState,
      userVote: prevState.userVote === 1 ? 0 : 1,
      upvotes:
        prevState.userVote === 1
          ? prevState.upvotes - 1
          : prevState.upvotes + 2,
    }));
    if (!user?.userId) {
      return;
    }
    const mutation = schema === "comment" ? upvoteComment : upvotePost;
    await mutation(user?.userId, id);
  };

  const onDownvote = async (e: MouseEvent) => {
    e.preventDefault();
    setUpvoteState((prevState) => ({
      ...prevState,
      userVote: prevState.userVote === -1 ? undefined : -1,
      upvotes:
        prevState.userVote === -1
          ? prevState.upvotes + 1
          : prevState.upvotes - 2,
    }));
    if (!user?.userId) {
      return;
    }
    const mutation = schema === "comment" ? downvoteComment : downvotePost;
    await mutation(user?.userId, id);
  };

  const isUpvoted = upvoteState.userVote === 1;
  const isDownvoted = upvoteState.userVote === -1;

  return (
    <div
      className={cn(
        "flex items-center rounded-lg text-accent-foreground",
        upvoteState.userVote ? "bg-reddit" : "bg-accent",
      )}
    >
      <Button
        className={cn(
          isUpvoted ? "hover:bg-accent/40" : "hover:bg-foreground/10",
        )}
        variant="ghost"
        size="icon"
        onClick={onUpvote}
      >
        <ArrowBigUp
          className={cn("h-6 w-6", { "text-foreground": isUpvoted })}
          fill={isUpvoted ? "#fff" : "none"}
        />
      </Button>
      <span className="grid min-w-3 place-items-center text-sm">
        {upvoteState.upvotes}
      </span>
      <Button
        className={cn(
          isDownvoted ? "hover:bg-accent/40" : "hover:bg-foreground/10",
        )}
        variant="ghost"
        size="icon"
        onClick={onDownvote}
      >
        <ArrowBigDown
          className={cn("h-6 w-6", { "text-foreground": isDownvoted })}
          fill={isDownvoted ? "#fff" : "none"}
        />
      </Button>
    </div>
  );
};

export default Upvotes;
