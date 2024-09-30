import PostCard from "@/components/posts/post-card";
import PostCreateModal from "@/components/posts/post-create-modal";
import { getAllPosts } from "@/server/queries/posts";

export default async function HomePage() {
  const allPosts = await getAllPosts();

  if (!allPosts) {
    return <div>Posts not found</div>;
  }

  return (
    <main className="mx-auto w-8/12">
      <PostCreateModal />
      <div className="flex flex-col gap-4">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
