"use client";
import type { MouseEvent } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import type { SelectPost } from "@/server/db/schema";
import { deletePost } from "@/server/queries/posts";
import { useRouter } from "next/navigation";

type Props = { post: SelectPost };

export function PostActionsDropdown({ post }: Props) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const handleEditClick = (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    router.push(`/post/${post.id}/edit`);
  };

  const handleDeleteClick = async (e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    await deletePost(post.id);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          ...
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleEditClick}>Edit</DropdownMenuItem>
        <DropdownMenuItem onClick={handleDeleteClick}>Delete</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
