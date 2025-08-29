"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User } from "@prisma/client";
import { useRouter } from "next/navigation";
import qs from "query-string";

interface Props {
  agencies: User[];
  searchParams: Record<string, string | string[] | undefined>;
  url: string;
}

function AgencyFilter({ agencies, searchParams, url: pathname }: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(agency) => {
        const { agency: curr, ...rest } = searchParams;

        const url = qs.stringifyUrl(
          {
            url: pathname,
            query: {
              ...rest,
              agency: agency !== "default" ? agency : null,
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger className="w-32 cursor-pointer">
        <SelectValue placeholder="Agence" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem value={"default"}>Default</SelectItem>
        {agencies.map((agency) => (
          <SelectItem key={agency.id} value={agency.id}>
            {agency.username}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export default AgencyFilter;
