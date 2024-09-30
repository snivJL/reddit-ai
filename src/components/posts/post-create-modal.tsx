"use client";

import { useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createPost } from "@/server/queries/posts";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} disabled={pending}>
      {pending ? "Creating..." : "Create Post"}
    </Button>
  );
}

export default function PostCreateModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [state, formAction] = useFormState(createPost, {
    errors: null,
    message: "",
  });
  const formRef = useRef<HTMLFormElement>(null);

  const handleAction = async (formData: FormData) => {
    formAction(formData);
    if (state.errors === null && !state.message.includes("Failed")) {
      setIsOpen(false);
      if (formRef.current) formRef.current.reset();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>Create Post</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a New Post</DialogTitle>
        </DialogHeader>
        <form ref={formRef} action={handleAction} className="space-y-4">
          <div>
            <Input name="title" placeholder="Title" required />
            {state.errors?.title && (
              <p className="text-sm text-red-500">{state.errors.title[0]}</p>
            )}
          </div>
          <div>
            <Textarea name="content" placeholder="Content" required />
            {state.errors?.content && (
              <p className="text-sm text-red-500">{state.errors.content[0]}</p>
            )}
          </div>
          <div>
            <Input name="media" type="file" accept="image/*,video/*" />
            {state.errors?.media && (
              <p className="text-sm text-red-500">{state.errors.media[0]}</p>
            )}
          </div>
          {state.message && state.errors && (
            <p className="text-sm text-red-500">{state.message}</p>
          )}
          <SubmitButton />
        </form>
      </DialogContent>
    </Dialog>
  );
}
