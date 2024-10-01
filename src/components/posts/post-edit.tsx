"use client";

import { type ChangeEvent, useEffect, useRef, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { editPost } from "@/server/queries/posts";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import type { SelectPost } from "@/server/db/schema";
import ImageBlur from "../image-blur";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" isLoading={pending} disabled={pending}>
      {pending ? "Updating..." : "Update Post"}
    </Button>
  );
}

type Props = {
  post: SelectPost;
};

export default function PostEdit({ post }: Props) {
  const [media, setMedia] = useState<File>();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [state, formAction] = useFormState(editPost, {
    errors: null,
    message: "",
  });
  const user = useAuth();
  const formRef = useRef<HTMLFormElement>(null);
  const router = useRouter();

  const handleAction = (formData: FormData) => {
    formData.append("id", post.id.toString());
    formAction(formData);
  };
  console.log(media);

  const handleMediaChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0)
      if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0]!;
        setMedia(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
      }
  };

  const handleCancel = () => {
    setMedia(undefined);
    setPreviewUrl(null);
    if (formRef.current) {
      formRef.current.reset();
    }
    router.back();
  };

  useEffect(() => {
    if (state.message && !state.errors) {
      router.push(`/post/${post.id}`);
    }
  }, [state, router, post.id]);

  if (!user.isSignedIn) {
    router.push("/sign-in");
    return null;
  }
  return (
    <div>
      <form ref={formRef} action={handleAction} className="space-y-4">
        <div>
          <Input name="title" placeholder="Title" defaultValue={post.title} />
          {state.errors?.title && (
            <p className="text-sm text-red-500">{state.errors.title[0]}</p>
          )}
        </div>
        <div>
          <Textarea
            name="content"
            placeholder="Content"
            defaultValue={post.content}
          />
          {state.errors?.content && (
            <p className="text-sm text-red-500">{state.errors.content[0]}</p>
          )}
        </div>
        <div>
          <Input
            name="media"
            type="file"
            accept="image/*,video/*"
            onChange={handleMediaChange}
          />
          {post.mediaUrl && (
            <ImageBlur url={previewUrl ?? post.mediaUrl} alt={post.title} />
          )}
          {state.errors?.media && (
            <p className="text-sm text-red-500">{state.errors.media[0]}</p>
          )}
        </div>
        {state.message && state.errors && (
          <p className="text-sm text-red-500">{state.message}</p>
        )}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <SubmitButton />
        </div>
      </form>
    </div>
  );
}
