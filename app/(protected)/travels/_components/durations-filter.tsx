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
  durations: string[];
  searchParams: Record<string, string | string[] | undefined>;
}

function DurationsFilter({ durations, searchParams }: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(duration) => {
        const { duration: curr, ...rest } = searchParams;
        const url = qs.stringifyUrl(
          {
            url: "/travels",
            query: {
              duration: duration !== "default" ? duration : null,
              ...rest,
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger dir="rtl" className="w-32 cursor-pointer">
        <SelectValue placeholder="المدة" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem dir="rtl" value={"default"}>
          لا شيئ
        </SelectItem>
        {durations.map((duration) => (
          <SelectItem dir="rtl" key={duration} value={duration}>
            {duration} ليالي
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DurationsFilter;
