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
      <SelectTrigger dir="rtl" className="w-32 cursor-pointer">
        <SelectValue placeholder="التوزيع" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem dir="rtl" value={"default"}>
          لا شيئ
        </SelectItem>
        {distributions.map((distribution) => (
          <SelectItem dir="rtl" key={distribution} value={distribution}>
            {distribution}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DistributionsFilter;
