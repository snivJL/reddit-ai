"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useEffect, useState } from "react";
import useDebounce from "@/hooks/use-debounce";
import { useRouter } from "next/navigation";
import { isEmptyOrWhitespace } from "@/lib/form";

const Searchbar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();
  const debouncedSearchTerm = useDebounce({ searchTerm });

  useEffect(() => {
    console.log(debouncedSearchTerm);
    if (!isEmptyOrWhitespace(searchTerm)) {
      router.push(`/?q=${debouncedSearchTerm}`);
    } else {
      router.push("/");
    }
  }, [debouncedSearchTerm]);

  return (
    <div className="relative">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 transform text-muted-foreground" />
      <Input
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        type="search"
        placeholder="Search..."
        className="w-64 pl-8"
      />
    </div>
  );
};

export default Searchbar;
