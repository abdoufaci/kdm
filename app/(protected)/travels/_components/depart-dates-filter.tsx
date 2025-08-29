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
  departs: string[];
  searchParams: Record<string, string | string[] | undefined>;
  url: string;
}

function DepartDatesFilter({ departs, searchParams, url: pathname }: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(depart) => {
        const { depart: curr, ...rest } = searchParams;
        let date: Date | null = null;
        if (depart !== "default") {
          const [day, month, year] = depart.split("/");
          date = new Date(`${year}-${month}-${day}`);
        }

        const url = qs.stringifyUrl(
          {
            url: pathname,
            query: {
              ...rest,
              date: date?.toString(),
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger dir="rtl" className="w-32 cursor-pointer">
        <SelectValue placeholder="تاريخ الانطلاق" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem dir="rtl" value={"default"}>
          لا شيئ
        </SelectItem>
        {departs.map((depart) => (
          <SelectItem dir="rtl" key={depart} value={depart}>
            {depart}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default DepartDatesFilter;
