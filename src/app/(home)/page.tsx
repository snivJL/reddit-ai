import PostCard from "@/components/posts/post-card";
import { getAllPosts } from "@/server/queries/posts";

export default async function HomePage() {
  const allPosts = await getAllPosts();
  if (!allPosts) {
    return <div>Posts not found</div>;
  }

  return (
    <main className="mx-auto w-8/12">
      <div className="flex items-center justify-between py-4">
        <h1 className="text-3xl font-bold">Popular Posts</h1>
      </div>
      <div className="flex flex-col gap-4">
        {allPosts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </main>
  );
}
