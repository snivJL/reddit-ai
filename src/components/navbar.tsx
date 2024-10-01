import Link from "next/link";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/mode-toggle";
import { Search } from "lucide-react";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import PostCreateModal from "./posts/post-create-modal";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-white to-reddit bg-clip-text text-transparent">
            RedditClone
          </span>
        </Link>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-64 pl-8"
            />
          </div>
          <PostCreateModal />
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
          <ModeToggle />
        </div>
      </div>
    </nav>
  );
}
