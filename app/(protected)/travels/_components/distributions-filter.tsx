"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import qs from "query-string";

interface Props {
  distributions: string[];
  searchParams: Record<string, string | string[] | undefined>;
}

function DistributionsFilter({ distributions, searchParams }: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(distribution) => {
        const { distribution: curr, ...rest } = searchParams;
        const url = qs.stringifyUrl(
          {
            url: "/travels",
            query: {
              ...rest,
              distribution: distribution !== "default" ? distribution : null,
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger className="w-32 cursor-pointer">
        <SelectValue placeholder="distributions" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem value={"default"}>Default</SelectItem>
        {distributions.map((distribution) => (
          <SelectItem key={distribution} value={distribution}>
            {distribution}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DistributionsFilter;
