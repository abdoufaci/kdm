"use client";

import { Input } from "@/components/ui/input";
import { useDebounce } from "@uidotdev/usehooks";
import { Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import qs from "query-string";

interface Props {
  url: string;
  searchParams: Record<string, string | string[] | undefined>;
}

export default function SearchFilter({ url: pathname, searchParams }: Props) {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const router = useRouter();
  const { page, search, ...rest } = searchParams;

  useEffect(() => {
    const url = qs.stringifyUrl(
      {
        url: pathname,
        query: {
          search:
            debouncedSearchTerm.trim() === ""
              ? null
              : debouncedSearchTerm.trim(),
          ...rest,
        },
      },
      { skipNull: true }
    );
    router.push(url);
  }, [debouncedSearchTerm]);

  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A7ABAF]" />
      <Input
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.currentTarget.value);
        }}
        type="search"
        placeholder="Search"
        className="pl-9 pr-4 py-3 rounded-xl border border-[#E6E7E8] w-full placeholder:text-[#A7ABAF]"
      />
    </div>
  );
}
