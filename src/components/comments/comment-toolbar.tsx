"use client";

import { MessageSquareIcon, MoreHorizontalIcon } from "lucide-react";
import { Button } from "../ui/button";
import type { SelectComment } from "@/server/db/schema";
import { useState } from "react";
import CommentAdd from "./comment-add";

const CommentToolbar = ({ comment }: { comment?: SelectComment }) => {
  const [showForm, setShowForm] = useState(false);
  return (
    <>
      <div className="flex items-center space-x-4 text-xs">
        <Button variant="ghost" onClick={() => setShowForm(true)}>
          <MessageSquareIcon className="mr-2 h-4 w-4" />
          <span>Reply</span>
        </Button>
        <Button variant="ghost">
          <MoreHorizontalIcon className="mr-2 h-4 w-4" />
        </Button>
      </div>
      {showForm && (
        <CommentAdd
          parentId={comment?.id}
          onSuccess={() => setShowForm(false)}
        />
      )}
    </>
  );
};

export default CommentToolbar;
