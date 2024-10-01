import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import PostCreateModal from "./posts/post-create-modal";
import Searchbar from "./searchbar";

export default function Navbar() {
  return (
    <nav className="border-b">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold">
          <span className="bg-gradient-to-r from-white to-reddit bg-clip-text text-transparent">
            Reddit AI
          </span>
        </Link>
        <Searchbar />
        <div className="flex items-center space-x-4">
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
