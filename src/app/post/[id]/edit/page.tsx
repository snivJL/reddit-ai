import PostEdit from "@/components/posts/post-edit";
import { getPostById } from "@/server/queries/posts";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const post = await getPostById(Number(params.id));

  if (!post) {
    throw new Error("Post not found");
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Edit Post</h1>
      <div className="rounded-lg border bg-card p-8 text-card-foreground shadow-sm">
        <PostEdit post={post} />
      </div>
    </div>
  );
}
